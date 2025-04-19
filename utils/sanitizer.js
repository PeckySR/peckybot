// sanitizer.js

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .normalize("NFKC") // Normalize Unicode to prevent homoglyph attacks
        .replace(/[^\w!@#$%^&*()_+={}\[\]:;<>,.?/~\-À-žÆæ| ]/g, '') // Allow valid chars including Æ
        .trim();
}

module.exports = { sanitizeInput };
