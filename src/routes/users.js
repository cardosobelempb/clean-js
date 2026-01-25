module.exports = () => {
  const findAll = (req, res) => {
    const users = [{ name: 'John Doe', email: 'john@email.com' }];
    res.status(200).json(users);
  };

  const create = (req, res) => {
    const users = [{ name: 'Walter Mitty', email: 'walter@emailcom' }];
    res.status(201).json(req.body);
  };

  return { findAll, create };
};
