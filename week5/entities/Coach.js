const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Coach",
  tableName: "COACH",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    user_id: {
      type: "uuid",
      unique: true,
      nullable: false,
      foreignKey: {
        name: "coach_user_id_fkey",
        columnNames: ["user_id"],
        referencedTableName: "USER",
        referencedColumnNames: ["id"],
      },
    },
    experience_years: {
      type: "integer",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: false,
    },
    profile_image_url: {
      type: "varchar",
      length: 2048,
    },
    create_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
    update_at: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
    },
  },
});
