require("dotenv").config();
const TikTokFollowerCount = require("./tiktokfollow.js");
const gpiop = require("rpi-gpio").promise;
const GPIO_ON = process.env.GPIO;
let interval = null;
console.log("Initialized.");
const start = async () => {
  if (GPIO_ON)
    await gpiop.setup(11, gpiop.DIR_OUT, gpiop.EDGE_NONE, console.log);
  const tracker = new TikTokFollowerCount("wyatt.main", 30000);
  console.log("Starting application!");
  tracker.on("followerChange", async (data) => {
    if (interval !== null) {
      clearInterval(interval);
    }
    console.log("Turning off LED.");
    if (GPIO_ON) await gpiop.write(11, false, console.log);
    console.log("Got follower change");
    console.log(
      `Have ${data.current} followers. Previous query ${data.previous}. Difference of ${data.difference}`
    );
    if (data.current > data.previous) {
      let timeBetween = Math.min(30 / (data.difference * 2), 1);
      console.log(
        "Gained " + data.difference + " followers. Split time: " + timeBetween
      );
      let on = true;
      let i = 0;
      interval = setInterval(async () => {
        console.log("Write " + on);
        if (GPIO_ON) await gpiop.write(11, on, console.log);
        on = !on;
        if (i === data.difference - 1) {
          clearInterval(interval);
          console.log("Turning off LED.");
          if (GPIO_ON) await gpiop.write(11, false, console.log);
        }
      }, timeBetween * 1000);
    } else if (data.current < data.previous) {
      console.log("Lost " + (data.previous - data.current) + " followers.");
    }
  });
};
start();
