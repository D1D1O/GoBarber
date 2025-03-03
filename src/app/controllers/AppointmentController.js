import Appointment from "../models/Appointment";
import User from "../models/User";
import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import File from "../models/File";
import Notification from "../schemas/Notification";
import Queue from "../../lib/Queue";
import cancellationMail from "../jobs/cancellationMail";

class AppointmentController{
  async index(req,res){

    const {page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where:{ user_id: req.userID , canceled_at: null},
      order:['date'],
      attributes:['id','date','past','cancelable'],
      limit: 20,
      offset:(page - 1)*20,
      include:[
        {
          model: User,
          as: 'provider',
          attributes: ['id','name'],
          include:[
            {
              model: File,
              as: 'avatar',
              attributes:['id','path','url'],
            },
          ],
        },
      ],
    });  
    return res.json(appointments);
  } 



  async store(req,res){
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({ error: 'Validation fails'});
    }
    
    const { provider_id, date } = req.body;

    const isProvaider = await User.findOne({
      where:{
        id: provider_id,provider: true
      },
    })

    if(!isProvaider){
      return res.status(400).json({ error: 'You can only appointments with providers'});
    }


    if(provider_id == req.userID){
      return res.status(400).json({ error: 'Not can open appontments for you'});
    }


    const hourStart = startOfHour(parseISO(date));
    console.log(hourStart);
    if(isBefore(hourStart, new Date())){
      return res.status(400).json({ error: 'Past dates are not permitted'});
    } 

    /*
    * Check date availability
    */
   const checkAvailability = await Appointment.findOne({
     where: {
      provider_id,
      canceled_at: null,
      date: hourStart
     }
   });

   if (checkAvailability){
    return res.status(400).json({ error: 'Appoint data is not available'});
   }

   /*
    *  Notify appointment provider
    */
   const user = await User.findByPk(req.userID);
   const formattedDate = format(
    hourStart,
    "'dia' dd 'de' MMMM', às' H:mm'h'",
    {locale:pt}
   );

   
   await Notification.create({
      content: `Novo Agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
   });

  

    const appointment = await Appointment.create({
      user_id: req.userID,
      provider_id,
      date: hourStart,
    });

    return res.json(appointment);

  }

  async delete(req,res){

    const appointment = await Appointment.findByPk(req.params.id,{
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name','email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        }
      ]
    });

    if(appointment.user_id !== req.userID){
      return res.status(401).json({ error: "You don't have permission to cancel this appointment."});
    }

    const dataWithSub = subHours(appointment.date,2);
    
    if(isBefore(dataWithSub,new Date())){
      return res.status(401).json({ error: "You can only cancel appointments 2 hours in advance."});
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(cancellationMail.key,{ appointment });

    return res.json(appointment);
  }
}
export default new AppointmentController();