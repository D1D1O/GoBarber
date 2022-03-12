import Notification from "../schemas/Notification";
import User from "../models/User";

class NotificationController{
  async index(req,res){


    const isProvaider = await User.findOne({
      where:{
        id: req.userID ,provider: true
      },
    })

    if(!isProvaider){
      return res.status(400).json({ error: 'Only provider can load notifications'});
    }

    const notifications = await Notification.find({
      user: req.userID,
    }).sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

}

export default new NotificationController();