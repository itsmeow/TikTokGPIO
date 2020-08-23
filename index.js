require("dotenv").config();
const gpiop = require("rpi-gpio").promise;
const fetch = require("node-fetch");
let lastFollowers = -1;
let interval = null;
const start = async () => {
  await gpiop.setup(11, gpiop.DIR_OUT, gpiop.EDGE_NONE, console.log);
  const updateFollowers = () => {
    if (interval !== null) {
      clearInterval(interval);
    }
    console.log("Re-fetching followers");
    fetch(
      `https://api19-normal-c-useast1a.tiktokv.com/aweme/v1/user/profile/other/?sec_user_id=${process.env.sec_user_id}&address_book_access=1&from=0&region=US&version_name=17.3.4&ts=1598218154&timezone_name=America%2FDetroit&device_type=SCH-S968C&iid=${process.env.install_id}&locale=en&app_type=normal&build_number=17.3.4&resolution=720*1280&aid=1233&app_name=musical_ly&appTheme=light&_rticket=1598218156773&device_platform=android&version_code=170304&carrier_region=US&uoo=0&dpi=320&openudid=${process.env.device_open_udid}&cdid=${process.env.cdid}&cpu_support64=false&sys_region=US&ssmix=a&os_api=16&timezone_offset=-18000&device_id=${process.env.device_id}&pass-route=1&device_brand=samsung&manifest_version_code=2021703040&os_version=4.1.2&ab_version=17.3.4&ac2=wifi&host_abi=armeabi-v7a&update_version_code=2021703040&op_region=US&app_language=en&ac=wifi&pass-region=1&language=en&carrier_region_v2=310&storage_type=2&channel=googleplay`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "com.zhiliaoapp.musically/2021703040 (Linux; U; Android 4.1.2; en_US; SCH-S968C; Build/JZO54K; Cronet/TTNetVersion:82326b0c 2020-08-05 QuicVersion:0144d358 2020-03-24)",
          "x-khronos": process.env.khronos,
          "x-gorgon": process.env.gorgon,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        let user = res.user;
        let follow = user.follower_count;
        console.log(follow);
        if (follow > lastFollowers) {
          let diff = follow - lastFollowers;
          let timeBetween = Math.min(30 / (diff * 2), 1);
          console.log(
            "Gained " + diff + " followers. Split time: " + timeBetween
          );
          let on = true;
          interval = setInterval(async () => {
            console.log("Write " + on);
            await gpiop.write(11, on, console.log);
            on = !on;
          }, timeBetween * 1000);
        } else if (follow < lastFollowers) {
          console.log("Lost " + (lastFollowers - follow) + " followers.");
        }
        lastFollowers = follow;
        setTimeout(updateFollowers, 30000);
      })
      .catch(console.log);
  };
  updateFollowers();
};
start();
