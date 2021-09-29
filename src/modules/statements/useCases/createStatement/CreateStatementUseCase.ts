import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from '../../entities/Statement';

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, receiver_id, type, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(type === OperationType.WITHDRAW) {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    } else if (type === OperationType.TRANSFER) {
      const receiverId = receiver_id!
      const receiver = await this.usersRepository.findById(receiverId!)

      if (!receiver) {
        throw new CreateStatementError.ReceiverUserNotFound()
      }

      await this.statementsRepository.getUserBalance({
        user_id: receiverId,
      })

      const statementTransferOperation = await this.statementsRepository.create(
        {
          user_id,
          receiver_id: receiver.id,
          type,
          description,
          amount,
        }
      )
      return statementTransferOperation
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
