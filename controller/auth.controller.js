const authService = require("../service/auth.service");

const login = async (req, res) => {
  const requestData = {
    body: req.body,
    ip: req.ip,
    headers: req.headers,
  };

  const data = await authService.login(requestData);

  return res.status(data.status).send(data.data);
};

const signup = async (req, res) => {
  const data = await authService.signup({ ...req.body });
  return res.status(data.status).send(data);
};
const refreshToken = async (req, res) => {
  const data = await authService.refreshToken({ ...req.body });
  return res.status(data.status).send(data);
};

module.exports = { login, signup, refreshToken };
