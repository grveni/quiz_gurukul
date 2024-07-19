const Role = require('..//models/Role');

async function demoRoleFunctions() {
  // Delete all roles
  const deletedRole = await Role.deleteAll();
  console.log('Deleted all Role');
  //Reset index
  // Add new role
  newRole = await Role.create('Admin');
  console.log('New Role:', newRole);
  newRole = await Role.create('Mentor');
  console.log('New Role:', newRole);
  newRole = await Role.create('Parent');
  console.log('New Role:', newRole);
  newRole = await Role.create('Student');
  console.log('New Role:', newRole);
  /* // Find role by ID
  const roleById = await roleModel.findById(newRole.id);
  console.log('Role By ID:', roleById);

  // Find role by Name
  const roleByName = await roleModel.findByName('Admin');
  console.log('Role By Name:', roleByName);

  // Update role by ID
  const updatedRole = await roleModel.updateById(newRole.id, 'Super Admin');
  console.log('Updated Role:', updatedRole);

  // Find all roles
  const allRoles = await roleModel.findAll();
  console.log('All Roles:', allRoles);

  // Delete role by ID
  const deletedRole = await roleModel.deleteById(newRole.id);
  console.log('Deleted Role:', deletedRole);*/
}

demoRoleFunctions().catch(console.error);
