const fs = require('fs');
const path = require('path');
const { Letter, User, UserDepartment, Management, Department } = require('../models/exportModels');

/**
 * Create a new letter
 */
exports.create = async (req, res) => {
  try {
    const { subject, body, senderType, senderId, receiverType, receiverId } = req.body;

    if (!subject || !senderType || !senderId || !receiverType || !receiverId) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    let attachment = null;
    if (req.file) {
      attachment = req.file.filename; // multer stores file with unique filename
    }

    const letter = await Letter.create({
      subject,
      body: body || null,
      attachment,
      senderType,
      senderId,
      receiverType,
      receiverId
    });

    res.status(201).json(letter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create letter' });
  }
};

/**
 * Get all letters
 */
exports.getAll = async (req, res) => {
  try {
    const letters = await Letter.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        // Conditionally include the sender table based on senderType
        {
          model: Management,
          as: 'senderManagement',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: UserDepartment,
          as: 'senderUserDept',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: User,
          as: 'senderUser',
          required: false,
          attributes: ['id', 'fullName', 'email'],
        },

        // Conditionally include the receiver table based on receiverType
        {
          model: Management,
          as: 'receiverManagement',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: UserDepartment,
          as: 'receiverUserDept',
          required: false,
          include: [
            { model: User, as: 'User', attributes: ['id', 'fullName', 'email'] },
            { model: Department, as: 'Department', attributes: ['id', 'name'] },
          ],
        },
        {
          model: User,
          as: 'receiverUser',
          required: false,
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    // Filter each letter to keep only the sender/receiver table that matches the type
    const formattedLetters = letters.map((letter) => {
      const formatted = letter.toJSON();

      // Sender
      if (formatted.senderType === 'Management') {
        formatted.sender = formatted.senderManagement;
      } else if (formatted.senderType === 'UserDepartment') {
        formatted.sender = formatted.senderUserDept;
      } else if (formatted.senderType === 'User') {
        formatted.sender = formatted.senderUser;
      }
      delete formatted.senderManagement;
      delete formatted.senderUserDept;
      delete formatted.senderUser;

      // Receiver
      if (formatted.receiverType === 'Management') {
        formatted.receiver = formatted.receiverManagement;
      } else if (formatted.receiverType === 'UserDepartment') {
        formatted.receiver = formatted.receiverUserDept;
      } else if (formatted.receiverType === 'User') {
        formatted.receiver = formatted.receiverUser;
      }
      delete formatted.receiverManagement;
      delete formatted.receiverUserDept;
      delete formatted.receiverUser;

      return formatted;
    });

    res.json(formattedLetters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Get a single letter by ID
 */
exports.getById = async (req, res) => {
  try {
    const letter = await Letter.findByPk(req.params.id, {
      include: [
        {
          model: Management,
          as: 'senderManagement',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: UserDepartment,
          as: 'senderUserDept',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: User,
          as: 'senderUser',
          required: false,
          attributes: ['id', 'fullName', 'email'],
        },

        {
          model: Management,
          as: 'receiverManagement',
          required: false,
          include: [{ model: User, as: 'User', attributes: ['id', 'fullName', 'email'] }],
        },
        {
          model: UserDepartment,
          as: 'receiverUserDept',
          required: false,
          include: [
            { model: User, as: 'User', attributes: ['id', 'fullName', 'email'] },
            { model: Department, as: 'Department', attributes: ['id', 'name'] },
          ],
        },
        {
          model: User,
          as: 'receiverUser',
          required: false,
          attributes: ['id', 'fullName', 'email'],
        },
      ],
    });

    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    const formatted = letter.toJSON();

    // Sender
    if (formatted.senderType === 'Management') {
      formatted.sender = formatted.senderManagement;
    } else if (formatted.senderType === 'UserDepartment') {
      formatted.sender = formatted.senderUserDept;
    } else if (formatted.senderType === 'User') {
      formatted.sender = formatted.senderUser;
    }
    delete formatted.senderManagement;
    delete formatted.senderUserDept;
    delete formatted.senderUser;

    // Receiver
    if (formatted.receiverType === 'Management') {
      formatted.receiver = formatted.receiverManagement;
    } else if (formatted.receiverType === 'UserDepartment') {
      formatted.receiver = formatted.receiverUserDept;
    } else if (formatted.receiverType === 'User') {
      formatted.receiver = formatted.receiverUser;
    }
    delete formatted.receiverManagement;
    delete formatted.receiverUserDept;
    delete formatted.receiverUser;

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch letter' });
  }
};

/**
 * Update a letter
 */
exports.update = async (req, res) => {
  try {
    const { subject, body, senderType, senderId, receiverType, receiverId } = req.body;
    const letter = await Letter.findByPk(req.params.id);
    if (!letter) return res.status(404).json({ error: 'Letter not found' });

    // Remove old attachment if new file uploaded
    if (req.file && letter.attachment) {
      const oldPath = path.join(__dirname, '../uploads/', letter.attachment);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await letter.update({
      subject: subject || letter.subject,
      body: body !== undefined ? body : letter.body,
      attachment: req.file ? req.file.filename : letter.attachment,
      senderType: senderType || letter.senderType,
      senderId: senderId || letter.senderId,
      receiverType: receiverType || letter.receiverType,
      receiverId: receiverId || letter.receiverId
    });

    res.json(letter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update letter' });
  }
};

/**
 * Delete a letter
 */
exports.delete = async (req, res) => {
  try {
    const letter = await Letter.findByPk(req.params.id);
    if (!letter) return res.status(404).json({ error: 'Letter not found' });

    // Delete attachment from disk
    if (letter.attachment) {
      const filePath = path.join(__dirname, '../uploads/', letter.attachment);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await letter.destroy();
    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete letter' });
  }
};