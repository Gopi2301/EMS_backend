// const checkAdminRole = async (req, res, next) => {
//     try{
//         const user = await user.findById(req.user.id);
//         if(user.role === 'admin'){
//             next();
//     } else {
//       res.status(401).json({ message: 'Access denied, Admin only' });
//     }
// } catch(err){
//     console.log(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// }
// module.exports = checkAdminRole;