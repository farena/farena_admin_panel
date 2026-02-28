/* eslint-disable no-undef */
module.exports = function generateMenu(nameVariants) {
  const { 
    pluralCC, pluralPCSpaced 
  } = nameVariants

  return `  {
    icon: 'fa-solid fa-circle',
    title: '${pluralPCSpaced}',
    to: { name: '${pluralCC}' }
  }`
}
