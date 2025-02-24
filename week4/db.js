const { DataSource, EntitySchema } = require("typeorm");

const CreditPackage = new EntitySchema({
  name: "CreditPackage",
  tableName: "CREDIT_PACKAGE",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    credit_amount: {
      type: "int",
      nullable: false,
    },
    price: {
      type: "numeric",
      nullable: false,
      precision: 10,
      scale: 2,
    },
    create_at: {
      type: "timestamp",
      createDate: true,
    },
  },
});
const Skill = new EntitySchema({
  name: "Skill",
  tableName: "SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    create_at: {
      type: "timestamp",
      createDate: true,
    },
  },
});

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "test",
  database: process.env.DB_DATABASE || "test",
  entities: [CreditPackage, Skill],
  synchronize: true,
});

module.exports = AppDataSource;
