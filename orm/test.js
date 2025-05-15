// example.js
const { initORM } = require('./orm');

async function run() {
  try {

    const connectionUrl = 'postgresql://postgres:guruji1*@localhost:5432/fastapi';
    const models = await initORM(connectionUrl);

    console.log("models",models);


    const User = models.users;
    if (!User) {
      throw new Error('Users table not found in database');
    }


    const newUser = await User.create({
      password: 'karthik',
      email: 'karthiknadar12066@gmail.com'
    });
    console.log('Created user:', newUser);


    const allUsers = await User.findAll();
    console.log('All users:', allUsers);


    const user = await User.findById(newUser.id);
    console.log('User by ID:', user);


    const updatedUser = await User.update(newUser.id, {
      email: 'updated@example.com',
      password: 'newpassword123'
    });
    console.log('Updated user:', updatedUser);


    const deletedUser = await User.delete(newUser.id);
    console.log('Deleted user:', deletedUser);


    console.log('Available models:', Object.keys(models));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {

    await global.pool.end();
  }
}

run();