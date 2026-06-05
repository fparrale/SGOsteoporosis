import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './AvatarSelector.css';

const AVATARS = [
    { id: 1, name: 'Alegre',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alegre' },
    { id: 2, name: 'Cool',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=sixsevbenbbn' },
    { id: 3, name: 'Divertido', url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=xrlev' },
    { id: 4, name: 'Tímido',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=timidoop' },
    { id: 5, name: 'Loco',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zoe' },
];

const AvatarSelector = ({ selectedAvatar, onAvatarSelect, t }) => {
    return (
        <motion.div
            className="avatar-section"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
            <h3 className="avatar-title">{t('choose_avatar')}</h3>
            <div className="avatar-grid">
                {AVATARS.map((avatar, i) => (
                    <motion.button
                        key={avatar.id}
                        className={`avatar-btn ${selectedAvatar.id === avatar.id ? 'avatar-btn--selected' : ''}`}
                        onClick={() => onAvatarSelect(avatar)}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                    >
                        <img src={avatar.url} alt={avatar.name} className="avatar-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        {selectedAvatar.id === avatar.id && (
                            <motion.span
                                className="avatar-check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            >
                                <Check size={10} strokeWidth={3} />
                            </motion.span>
                        )}
                        <span className="avatar-name">{avatar.name}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default AvatarSelector;
