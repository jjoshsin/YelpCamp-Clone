// exporting function specifically to catch async errors
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}