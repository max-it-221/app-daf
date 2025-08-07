const express = require('express');
const app = express();
const citoyenRoutes = require('./routes/citoyen.routes');
const logger = require('./middlewares/logger');

app.use(express.json());
app.use(logger);

app.use('/api', citoyenRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
