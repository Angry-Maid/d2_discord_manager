require('dotenv').config();

const yup = require('yup');

exports.categorySearchSchema = yup.object().shape({
  guildId: yup.number(),
});

exports.categoryUpdateSchema = yup.object().shape({
  categoryId: yup.number().required(),
  selected: yup.boolean().required(),
});
