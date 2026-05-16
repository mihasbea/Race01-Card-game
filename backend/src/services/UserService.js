const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
    /**
     * Registers a new user in the system after validating uniqueness of username and email.
     * Hashes the password before saving.
     * @param {Object} userData - Data for creating a user.
     * @param {string} userData.username - Chosen unique username.
     * @param {string} userData.email - Chosen unique email address.
     * @param {string} userData.password - Plain text password.
     * @returns {Promise<Object>} The created user's basic info (id, username, email).
     * @throws {Error} If username or email already exists.
     */
    async createUser({ username, email, password }) {
        const existingUser = await UserRepository.findOne('username', username);
        if (existingUser) {
            throw new Error('Command already exists in the system'); // Примітка: тут можливо мало бути 'Username...'
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

    /**
     * Authenticates a user by their username and password.
     * Generates a JWT token upon successful authentication.
     * @param {string} username - The user's username.
     * @param {string} password - The user's plain text password.
     * @returns {Promise<Object>} Authentication data containing the JWT token and basic user details.
     * @throws {Error} If user is not found or password does not match.
     */
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

    /**
     * Finds and retrieves a user by their unique database ID.
     * @param {number|string} id - The unique identifier of the user.
     * @returns {Promise<Object|null>} The user entity if found, otherwise null.
     */
    async findById(id) {
        return await UserRepository.findOne('id', id);
    }

    /**
     * Retrieves the leaderboard data.
     * @param {number} [number=10] - The maximum number of top players to retrieve.
     * @returns {Promise<Array<Object>>} A list of top users ordered by wins.
     */
    async getLeaderboard(number = 10) {
        return await UserRepository.getLeaderboard(number);
    }

    /**
     * Updates specific user profile fields or statistics by user ID.
     * @param {number|string} id - The unique identifier of the user.
     * @param {Object} updateData - Key-value pairs of fields to be updated.
     * @returns {Promise<Object|void>} The database query result.
     */
    async updateUser(id, updateData) {
        return await UserRepository.update(id, updateData);
    }
}

module.exports = new UserService();