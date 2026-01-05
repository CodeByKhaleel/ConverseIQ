export const statusController = (req, res) => {
  res.json({ service: 'ConverseIQ backend', status: 'running' });
};
