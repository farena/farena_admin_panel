/* eslint-disable no-undef */
module.exports = function generateRoute(nameVariants) {
  const { 
    pluralSC, pluralCC, pluralPC 
  } = nameVariants

  return `      {
        path: '${pluralSC}',
        name: '${pluralCC}',
        component: () => import('@/views/Dashboard/${pluralPC}.vue')
      },`
}
