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

  async update(req,res){

    //const notification = await Notification.findById(req.params.id);

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true}
    );

    return res.json(notification);
  }


}

export default new NotificationController();