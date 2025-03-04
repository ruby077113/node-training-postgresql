const validation = {
  validateString: (str) => {
    return (
      str !== undefined && typeof str === "string" && str.trim().length !== 0
    );
  },
  validatedInteger: (num) => {
    return num !== undefined && typeof num === "number" && num % 1 === 0;
  },
};

module.exports = validation;
