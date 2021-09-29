import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { receiver_id } = request.params;
    const { amount, description } = request.body;

    let type = '' as OperationType;

    if (receiver_id) {
      type = OperationType.TRANSFER;
    } else {
      const splittedPath = request.originalUrl.split('/')
      type = splittedPath[splittedPath.length - 1] as OperationType;
    }

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
