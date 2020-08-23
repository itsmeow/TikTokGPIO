require("dotenv").config();

const signURL = async (url, ts, deviceId) => {
  const as = process.env.as;
  const cp = process.env.cp;
  return `${url}&as=${as}&cp=${cp}`;
};

const params = getRequestParams({
  device_id: process.env.device_id,
  fp: process.env.device_fingerprint,
  iid: process.env.install_id,
  openudid: process.env.device_open_udid,
});

const api = new TikTokAPI(params, { signURL });
api
  .getUser("")
  .then((res) => console.log(res.data.user))
  .catch(console.log);
