import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

import { randomPublicCode } from '../../../shared/helpers/random-code.helper';
import { User } from '../entities/user.entity';

const MAX_ATTEMPTS = 10;

/**
 * Dá a toda conta nova o seu código de identificação (`BORA-XXXXX`), venha de onde vier
 * (cadastro por e-mail, Google, comércio, seed). Confere colisão no mesmo banco/transação e
 * tenta de novo; o índice único de `users.public_code` segura o caso raro de corrida.
 * Registrado em `subscribers` da conexão do Nest (database.config) e da CLI (data-source).
 */
@EventSubscriber()
export class UserPublicCodeSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): typeof User {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    if (!event.entity || event.entity.publicCode) return;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const code = randomPublicCode();
      const taken = await event.manager.exists(User, { where: { publicCode: code }, withDeleted: true });
      if (!taken) {
        event.entity.publicCode = code;
        return;
      }
    }
    throw new Error('Não foi possível gerar um código de identificação único.');
  }
}
