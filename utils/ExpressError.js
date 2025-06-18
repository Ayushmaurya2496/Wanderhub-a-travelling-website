
class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message); // Parent class Error ka constructor call karna zaroori hota hai
        this.statusCode = statusCode; // Custom property daal di
    }
}

module.exports = ExpressError;
