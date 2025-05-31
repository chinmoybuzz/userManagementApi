const authService = require("../service/user.service");

const list = async (req, res) => {
  const data = await authService.list({ ...req.params, ...req.query });

  return res.status(data.status).send(data);
};

const updateParentId = async (req, res) => {
  const data = await authService.updateParentId({ userId: req.user.id, ...req.body });
  console.log(data);
  return res.status(data.status).send(data);
};
const tree = async (req, res) => {
  const data = await authService.treeView({ role: req.user.role, ...req.query });
  return res.status(data.status).send(data.data);
};

module.exports = { list, updateParentId, tree };
