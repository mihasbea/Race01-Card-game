const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
    async createUser({ username, email, password }) {
        const existingUser = await UserRepository.findOne('username', username);
        if (existingUser) {
            throw new Error('Command already exists in the system');
        }

        const existingEmail = await UserRepository.findOne('email', email);
        if (existingEmail) {
            throw new Error('Email already exists in the system');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = await UserRepository.create({
            username,
            email,
            password: hashedPassword
        });

        return {
            id: userId,
            username: username,
            email: email
        };
    }

    async authenticate(username, password) {
        const user = await UserRepository.findOne('username', username);

        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username }, 
            'SUPER_SECRET_KEY', 
            { expiresIn: '24h' }
        );

        return {
            token: token,
            userId: user.id,
            username: user.username
        };
    }

    async findeById(id) {
        return await UserRepository.findOne('id', id);
    }

    async getLeaderboard(number = 10) {
        return await UserRepository.getLeaderboard(number);
    }
}

module.exports = new UserService();