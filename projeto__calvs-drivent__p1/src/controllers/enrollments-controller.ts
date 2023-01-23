import { AuthenticatedRequest } from "@/middlewares";
import enrollmentsService from "@/services/enrollments-service";
import { Response } from "express";
import httpStatus from "http-status";
import axios from "axios";
import {ViaCEPAddress, ViaCEPAddressAPI} from "@/protocols"
export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });

    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const { cep } = req.query as Record<string, string>;
 
  try {
    const URL = `https://viacep.com.br/ws/${cep}/json/`;
    const response  = await axios.get(URL);
    const responseCEP = response.data as ViaCEPAddress 
    const responseCEPAPI = {
      
        logradouro: responseCEP.logradouro,
        complemento: responseCEP.complemento,
        bairro: responseCEP.bairro,
        localidade: responseCEP.localidade,
        uf: responseCEP.uf,
      

    };
 
    const address = await enrollmentsService.getAddressFromCEP();
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}

