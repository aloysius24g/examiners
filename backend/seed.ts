import db from './src/utils/database.js';
import bcrypt from 'bcrypt';
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function readInput(): Promise<string> {
  return new Promise(res => {
    rl.once('line', l => {
      res(l)
    });
  })
}

async function createAdminUser() {

  const adminUser = await db.nsUser.findFirst({
    where: {
      userName: {
        not: 'admin'
      }
    }
  });

  if(adminUser === null) {
    console.error('admin user found aborting');
    return;
  }


  console.log('admin user not found, creating one.');
  console.log('enter a password for admin');
  const pass = await readInput();
  console.log(pass)

  const passHash = await bcrypt.hash(pass, 9);

  await db.user.create({
    data: {
      id: 1000,
      accountType: 'NS',
      name: 'admin',
      salutation: 'Mr',
      passHash: passHash,
      nsDetails: {
        connect: {
          userId: 1000,
          userName: 'admin'
        }
      }
    }
  }); 
}


createAdminUser().then(_ => rl.close());
