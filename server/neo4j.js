const neo4j = require('neo4j-driver');

let driver;

const initNeo4j = () => {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD || 'password';

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    console.log('🔗 Connected to Neo4j Graph Database');
  } catch (error) {
    console.error('❌ Error connecting to Neo4j:', error);
  }
};

const getNeo4jSession = () => {
  if (!driver) {
    throw new Error('Neo4j driver is not initialized');
  }
  return driver.session();
};

const closeNeo4j = async () => {
  if (driver) {
    await driver.close();
    console.log('Neo4j connection closed.');
  }
};

module.exports = {
  initNeo4j,
  getNeo4jSession,
  closeNeo4j
};
