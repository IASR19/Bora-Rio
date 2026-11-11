import { businessTranslations } from './business-translations';
import { errorTranslations } from './error-messages';

export const translations: Record<string, { en: string; es: string }> = {
  ...businessTranslations,
  ...errorTranslations,
  Gênero: { en: 'Gender', es: 'Género' },
  'Complete seu cadastro antes de acessar a administração.': {
    en: 'Complete your profile before accessing administration.',
    es: 'Completa tu perfil antes de acceder a la administración.',
  },
  'Preencha idade, telefone e cidade pra continuar.': {
    en: 'Fill in your date of birth, phone and city to continue.',
    es: 'Introduce tu fecha de nacimiento, teléfono y ciudad para continuar.',
  },
  Sim: { en: 'Yes', es: 'Sí' },
  Não: { en: 'No', es: 'No' },
  'Sem alterações': { en: 'No changes', es: 'Sin cambios' },
  'Acesso administrativo atribuído': { en: 'Administrator access granted', es: 'Acceso de administrador asignado' },
  'Como funciona o BORA Score?': { en: 'How does BORA Score work?', es: '¿Cómo funciona BORA Score?' },
  'Preciso pagar pra usar o BORA?': { en: 'Do I have to pay to use BORA?', es: '¿Tengo que pagar para usar BORA?' },
  'Como excluo minha conta?': { en: 'How do I delete my account?', es: '¿Cómo elimino mi cuenta?' },
  'Nenhuma mensagem ainda. Puxe assunto!': {
    en: 'No messages yet. Start a conversation!',
    es: 'Aún no hay mensajes. ¡Inicia una conversación!',
  },
  'Diga oi 👋': { en: 'Say hi 👋', es: 'Di hola 👋' },
  Ativo: { en: 'Active', es: 'Activo' },
  Cancelado: { en: 'Canceled', es: 'Cancelado' },
  'Estamos conferindo seu contrato social.': {
    en: 'We are reviewing your business document.',
    es: 'Estamos revisando tu documento comercial.',
  },
  'Foto: {credit} · {license}': { en: 'Photo: {credit} · {license}', es: 'Foto: {credit} · {license}' },
  'Localização: {city}. Toque para trocar': {
    en: 'Location: {city}. Tap to change',
    es: 'Ubicación: {city}. Toca para cambiar',
  },
  Idioma: {
    en: 'Language',
    es: 'Idioma',
  },
  'Idioma salvo neste dispositivo. Não foi possível sincronizar a conta.': {
    en: 'Language saved on this device. Could not sync your account.',
    es: 'Idioma guardado en este dispositivo. No se pudo sincronizar la cuenta.',
  },
  Administração: {
    en: 'Administration',
    es: 'Administración',
  },
  'Painel administrativo': {
    en: 'Admin panel',
    es: 'Panel administrativo',
  },
  Administrador: {
    en: 'Administrator',
    es: 'Administrador',
  },
  Usuário: {
    en: 'User',
    es: 'Usuario',
  },
  Usuários: {
    en: 'Users',
    es: 'Usuarios',
  },
  'Usuário atualizado': {
    en: 'User updated',
    es: 'Usuario actualizado',
  },
  'Evento revisado': {
    en: 'Event reviewed',
    es: 'Evento revisado',
  },
  'Cadastro comercial revisado': {
    en: 'Business registration reviewed',
    es: 'Registro comercial revisado',
  },
  'Administradores podem revisar eventos e alterar o acesso de outros usuários.': {
    en: "Administrators can review events and change other users' access.",
    es: 'Los administradores pueden revisar eventos y cambiar el acceso de otros usuarios.',
  },
  'Acompanhe a comunidade, revise eventos e gerencie acessos.': {
    en: 'Track the community, review events and manage access.',
    es: 'Supervisa la comunidad, revisa eventos y gestiona accesos.',
  },
  'Voltar ao aplicativo': {
    en: 'Back to the app',
    es: 'Volver a la aplicación',
  },
  'Visão geral': {
    en: 'Overview',
    es: 'Resumen',
  },
  'Cadastros comerciais': {
    en: 'Business registrations',
    es: 'Registros comerciales',
  },
  Histórico: {
    en: 'History',
    es: 'Historial',
  },
  Filtros: {
    en: 'Filters',
    es: 'Filtros',
  },
  Região: {
    en: 'Region',
    es: 'Región',
  },
  Estado: {
    en: 'State',
    es: 'Estado',
  },
  Cidade: {
    en: 'City',
    es: 'Ciudad',
  },
  'Todas as cidades': {
    en: 'All cities',
    es: 'Todas las ciudades',
  },
  Todos: {
    en: 'All',
    es: 'Todos',
  },
  Categoria: {
    en: 'Category',
    es: 'Categoría',
  },
  'Categoria:': {
    en: 'Category:',
    es: 'Categoría:',
  },
  'Cadastro a partir de': {
    en: 'Registered from',
    es: 'Registro desde',
  },
  'Eventos a partir de': {
    en: 'Events from',
    es: 'Eventos desde',
  },
  Até: {
    en: 'Until',
    es: 'Hasta',
  },
  'Status do evento': {
    en: 'Event status',
    es: 'Estado del evento',
  },
  'Perfil de acesso': {
    en: 'Access role',
    es: 'Rol de acceso',
  },
  'Situação da conta': {
    en: 'Account status',
    es: 'Estado de la cuenta',
  },
  Situação: {
    en: 'Status',
    es: 'Estado',
  },
  Ativa: {
    en: 'Active',
    es: 'Activa',
  },
  Suspensa: {
    en: 'Suspended',
    es: 'Suspendida',
  },
  Buscar: {
    en: 'Search',
    es: 'Buscar',
  },
  'Nome do evento ou local': {
    en: 'Event or venue name',
    es: 'Nombre del evento o lugar',
  },
  'Nome ou e-mail': {
    en: 'Name or email',
    es: 'Nombre o correo',
  },
  'Região e estado consideram registros com UF informada.': {
    en: 'Region and state filters use records with a known state.',
    es: 'Los filtros de región y estado usan registros con estado informado.',
  },
  'Limpar filtros': {
    en: 'Clear filters',
    es: 'Limpiar filtros',
  },
  'Alterações salvas.': {
    en: 'Changes saved.',
    es: 'Cambios guardados.',
  },
  'Não foi possível carregar os dados.': {
    en: 'Could not load the data.',
    es: 'No se pudieron cargar los datos.',
  },
  'Tentar novamente': {
    en: 'Try again',
    es: 'Intentar de nuevo',
  },
  'Carregando...': {
    en: 'Loading...',
    es: 'Cargando...',
  },
  Locais: {
    en: 'Venues',
    es: 'Lugares',
  },
  'Período: eventos pela data de início, usuários pela data de cadastro e check-ins pela data de realização. Locais representam o catálogo atual.':
    {
      en: 'Period: events by start date, users by registration date and check-ins by check-in date. Venues reflect the current catalog.',
      es: 'Período: eventos por fecha de inicio, usuarios por fecha de registro y check-ins por fecha de realización. Los lugares reflejan el catálogo actual.',
    },
  'Status dos eventos': {
    en: 'Event status',
    es: 'Estado de los eventos',
  },
  'Eventos por cidade': {
    en: 'Events by city',
    es: 'Eventos por ciudad',
  },
  'Eventos por categoria': {
    en: 'Events by category',
    es: 'Eventos por categoría',
  },
  'Check-ins por dia': {
    en: 'Daily check-ins',
    es: 'Check-ins por día',
  },
  'Em análise': {
    en: 'Under review',
    es: 'En revisión',
  },
  Publicado: {
    en: 'Published',
    es: 'Publicado',
  },
  Rejeitado: {
    en: 'Rejected',
    es: 'Rechazado',
  },
  Aprovado: {
    en: 'Approved',
    es: 'Aprobado',
  },
  'Ver evento': {
    en: 'View event',
    es: 'Ver evento',
  },
  Revisar: {
    en: 'Review',
    es: 'Revisar',
  },
  Cadastro: {
    en: 'Registration',
    es: 'Registro',
  },
  Ações: {
    en: 'Actions',
    es: 'Acciones',
  },
  Editar: {
    en: 'Edit',
    es: 'Editar',
  },
  Responsável: {
    en: 'Performed by',
    es: 'Responsable',
  },
  Registro: {
    en: 'Record',
    es: 'Registro',
  },
  'Editar usuário': {
    en: 'Edit user',
    es: 'Editar usuario',
  },
  'Conta ativa': {
    en: 'Active account',
    es: 'Cuenta activa',
  },
  'Aparecer em Quem vai': {
    en: "Show in Who's going",
    es: 'Aparecer en Quién va',
  },
  'Salvar alterações': {
    en: 'Save changes',
    es: 'Guardar cambios',
  },
  'Salvando...': {
    en: 'Saving...',
    es: 'Guardando...',
  },
  Cancelar: {
    en: 'Cancel',
    es: 'Cancelar',
  },
  'Revisar submissão': {
    en: 'Review submission',
    es: 'Revisar envío',
  },
  'Carregando documento...': {
    en: 'Loading document...',
    es: 'Cargando documento...',
  },
  'Não foi possível carregar o documento.': {
    en: 'Could not load the document.',
    es: 'No se pudo cargar el documento.',
  },
  'Baixar contrato para análise': {
    en: 'Download document for review',
    es: 'Descargar documento para revisión',
  },
  'Motivo da decisão': {
    en: 'Reason for the decision',
    es: 'Motivo de la decisión',
  },
  Aprovar: {
    en: 'Approve',
    es: 'Aprobar',
  },
  Rejeitar: {
    en: 'Reject',
    es: 'Rechazar',
  },
  'Nenhum registro encontrado.': {
    en: 'No records found.',
    es: 'No se encontraron registros.',
  },
  'Nenhum dado para os filtros selecionados.': {
    en: 'No data for the selected filters.',
    es: 'No hay datos para los filtros seleccionados.',
  },
  registros: {
    en: 'records',
    es: 'registros',
  },
  Página: {
    en: 'Page',
    es: 'Página',
  },
  Anterior: {
    en: 'Previous',
    es: 'Anterior',
  },
  Próxima: {
    en: 'Next',
    es: 'Siguiente',
  },
  'Navegação administrativa': {
    en: 'Admin navigation',
    es: 'Navegación administrativa',
  },
  Início: {
    en: 'Home',
    es: 'Inicio',
  },
  Explorar: {
    en: 'Explore',
    es: 'Explorar',
  },
  Eventos: {
    en: 'Events',
    es: 'Eventos',
  },
  Perfil: {
    en: 'Profile',
    es: 'Perfil',
  },
  'Criar conta': {
    en: 'Create account',
    es: 'Crear cuenta',
  },
  'Não pedimos informações desnecessárias.': {
    en: 'We only ask for the essentials.',
    es: 'Solo pedimos la información necesaria.',
  },
  Nome: {
    en: 'Name',
    es: 'Nombre',
  },
  'Data de nascimento': {
    en: 'Date of birth',
    es: 'Fecha de nacimiento',
  },
  'Prefiro não dizer': {
    en: 'Prefer not to say',
    es: 'Prefiero no decirlo',
  },
  Feminino: {
    en: 'Female',
    es: 'Femenino',
  },
  Masculino: {
    en: 'Male',
    es: 'Masculino',
  },
  Outro: {
    en: 'Other',
    es: 'Otro',
  },
  'E-mail': {
    en: 'Email',
    es: 'Correo electrónico',
  },
  Senha: {
    en: 'Password',
    es: 'Contraseña',
  },
  'Criando...': {
    en: 'Creating...',
    es: 'Creando...',
  },
  Continuar: {
    en: 'Continue',
    es: 'Continuar',
  },
  'Já tem uma conta?': {
    en: 'Already have an account?',
    es: '¿Ya tienes una cuenta?',
  },
  Entrar: {
    en: 'Sign in',
    es: 'Iniciar sesión',
  },
  'Entrar no BORA': {
    en: 'Sign in to BORA',
    es: 'Entrar a BORA',
  },
  'Entrando...': {
    en: 'Signing in...',
    es: 'Iniciando sesión...',
  },
  'Ainda não tem conta?': {
    en: "Don't have an account yet?",
    es: '¿Aún no tienes cuenta?',
  },
  'Continuar com Google': {
    en: 'Continue with Google',
    es: 'Continuar con Google',
  },
  'Continuar com Apple': {
    en: 'Continue with Apple',
    es: 'Continuar con Apple',
  },
  ou: {
    en: 'or',
    es: 'o',
  },
  'Não foi possível criar sua conta.': {
    en: 'Could not create your account.',
    es: 'No se pudo crear tu cuenta.',
  },
  'Não foi possível entrar.': {
    en: 'Could not sign in.',
    es: 'No se pudo iniciar sesión.',
  },
  'Não foi possível continuar com o Google.': {
    en: 'Could not continue with Google.',
    es: 'No se pudo continuar con Google.',
  },
  'Enviamos um código para': {
    en: 'We sent a code to',
    es: 'Enviamos un código a',
  },
  'Código inválido.': {
    en: 'Invalid code.',
    es: 'Código inválido.',
  },
  'Validando...': {
    en: 'Validating...',
    es: 'Validando...',
  },
  Validar: {
    en: 'Validate',
    es: 'Validar',
  },
  'Reenviar código': {
    en: 'Resend code',
    es: 'Reenviar código',
  },
  'Complete seu cadastro': {
    en: 'Complete your profile',
    es: 'Completa tu perfil',
  },
  Celular: {
    en: 'Phone',
    es: 'Teléfono',
  },
  'Sua cidade': {
    en: 'Your city',
    es: 'Tu ciudad',
  },
  'CEP não encontrado — preencha a cidade manualmente.': {
    en: 'Postal code not found — enter your city manually.',
    es: 'Código postal no encontrado: escribe tu ciudad manualmente.',
  },
  'Não foi possível salvar seu cadastro.': {
    en: 'Could not save your profile.',
    es: 'No se pudo guardar tu perfil.',
  },
  'Conheça pessoas. Encontre experiências. Viva mais.': {
    en: 'Meet people. Find experiences. Live more.',
    es: 'Conoce personas. Encuentra experiencias. Vive más.',
  },
  'Como funciona': {
    en: 'How it works',
    es: 'Cómo funciona',
  },
  DESCUBRA: {
    en: 'DISCOVER',
    es: 'DESCUBRE',
  },
  'CONECTE-SE': {
    en: 'CONNECT',
    es: 'CONÉCTATE',
  },
  VÁ: {
    en: 'GO',
    es: 'VE',
  },
  Descubra: {
    en: 'Discover',
    es: 'Descubre',
  },
  'Conecte-se': {
    en: 'Connect',
    es: 'Conéctate',
  },
  Vá: {
    en: 'Go',
    es: 'Ve',
  },
  'Bares, restaurantes, festas, eventos e experiências.': {
    en: 'Bars, restaurants, parties, events and experiences.',
    es: 'Bares, restaurantes, fiestas, eventos y experiencias.',
  },
  'Veja pessoas que também pretendem ir.': {
    en: 'See who else is planning to go.',
    es: 'Mira quién más planea ir.',
  },
  'Confirme sua presença, faça check-in e aproveite.': {
    en: "Confirm you're going, check in and enjoy.",
    es: 'Confirma tu asistencia, haz check-in y disfruta.',
  },
  'Ative sua localização': {
    en: 'Enable location',
    es: 'Activa tu ubicación',
  },
  'Para descobrir o que está acontecendo perto de você.': {
    en: "To discover what's happening nearby.",
    es: 'Para descubrir lo que pasa cerca de ti.',
  },
  'Permitir localização': {
    en: 'Allow location',
    es: 'Permitir ubicación',
  },
  'Agora não': {
    en: 'Not now',
    es: 'Ahora no',
  },
  'O que você quer fazer hoje?': {
    en: 'What would you like to do today?',
    es: '¿Qué quieres hacer hoy?',
  },
  'Conhecer pessoas': {
    en: 'Meet people',
    es: 'Conocer personas',
  },
  Relacionamento: {
    en: 'Dating',
    es: 'Relación',
  },
  Amizade: {
    en: 'Friendship',
    es: 'Amistad',
  },
  'Sair hoje': {
    en: 'Go out today',
    es: 'Salir hoy',
  },
  Música: {
    en: 'Music',
    es: 'Música',
  },
  Festas: {
    en: 'Parties',
    es: 'Fiestas',
  },
  Gastronomia: {
    en: 'Food',
    es: 'Gastronomía',
  },
  Experiências: {
    en: 'Experiences',
    es: 'Experiencias',
  },
  Turismo: {
    en: 'Tourism',
    es: 'Turismo',
  },
  'Seus interesses musicais': {
    en: 'Your music interests',
    es: 'Tus gustos musicales',
  },
  Eletrônico: {
    en: 'Electronic',
    es: 'Electrónica',
  },
  'Tipo de ambiente': {
    en: 'Type of place',
    es: 'Tipo de ambiente',
  },
  'Faixa etária e distância': {
    en: 'Age range and distance',
    es: 'Rango de edad y distancia',
  },
  'Idade de interesse': {
    en: 'Preferred age range',
    es: 'Rango de edad de interés',
  },
  'Distância máxima': {
    en: 'Maximum distance',
    es: 'Distancia máxima',
  },
  'Qualquer distância': {
    en: 'Any distance',
    es: 'Cualquier distancia',
  },
  'Minha preferência': {
    en: 'My preference',
    es: 'Mi preferencia',
  },
  'Faixa de preço': {
    en: 'Price range',
    es: 'Rango de precios',
  },
  Econômico: {
    en: 'Budget',
    es: 'Económico',
  },
  Médio: {
    en: 'Mid-range',
    es: 'Medio',
  },
  Grátis: {
    en: 'Free',
    es: 'Gratis',
  },
  'Continuar grátis': {
    en: 'Continue for free',
    es: 'Continuar gratis',
  },
  'O que você está procurando?': {
    en: 'What are you looking for?',
    es: '¿Qué estás buscando?',
  },
  'O que você procura?': {
    en: 'What are you looking for?',
    es: '¿Qué buscas?',
  },
  'Definir localização': {
    en: 'Set location',
    es: 'Definir ubicación',
  },
  'Sua localização': {
    en: 'Your location',
    es: 'Tu ubicación',
  },
  Bares: {
    en: 'Bars',
    es: 'Bares',
  },
  'Roda de samba': {
    en: 'Samba circle',
    es: 'Ronda de samba',
  },
  Praias: {
    en: 'Beaches',
    es: 'Playas',
  },
  'Pontos turísticos': {
    en: 'Landmarks',
    es: 'Atracciones turísticas',
  },
  Cultura: {
    en: 'Culture',
    es: 'Cultura',
  },
  Parques: {
    en: 'Parks',
    es: 'Parques',
  },
  Aventura: {
    en: 'Adventure',
    es: 'Aventura',
  },
  Jantar: {
    en: 'Dining',
    es: 'Cena',
  },
  'BORA Agora': {
    en: 'BORA Now',
    es: 'BORA Ahora',
  },
  'BORA agora': {
    en: 'BORA now',
    es: 'BORA ahora',
  },
  'Eventos para você': {
    en: 'Events for you',
    es: 'Eventos para ti',
  },
  'Lugares perto de você': {
    en: 'Places near you',
    es: 'Lugares cerca de ti',
  },
  'Ver todos': {
    en: 'View all',
    es: 'Ver todos',
  },
  'Nenhum lugar desse tipo no seu raio.': {
    en: 'No places of this type within your radius.',
    es: 'No hay lugares de este tipo en tu radio.',
  },
  'Aumente a distância em Minhas preferências ou veja outra categoria.': {
    en: 'Increase your distance in My preferences or try another category.',
    es: 'Amplía la distancia en Mis preferencias o prueba otra categoría.',
  },
  'Aumente a distância para ver o que fica mais longe.': {
    en: 'Increase the distance to see places farther away.',
    es: 'Amplía la distancia para ver lugares más lejanos.',
  },
  'Nada encontrado nesse raio.': {
    en: 'Nothing found within this radius.',
    es: 'No se encontró nada en este radio.',
  },
  'Nada encontrado.': {
    en: 'Nothing found.',
    es: 'No se encontró nada.',
  },
  'Ver qualquer distância': {
    en: 'Search any distance',
    es: 'Ver cualquier distancia',
  },
  'Limpar busca': {
    en: 'Clear search',
    es: 'Limpiar búsqueda',
  },
  'Limpar categoria': {
    en: 'Clear category',
    es: 'Limpiar categoría',
  },
  'Buscando por': {
    en: 'Searching for',
    es: 'Buscando',
  },
  Lista: {
    en: 'List',
    es: 'Lista',
  },
  Mapa: {
    en: 'Map',
    es: 'Mapa',
  },
  'Aplicar filtros': {
    en: 'Apply filters',
    es: 'Aplicar filtros',
  },
  'Tente limpar a busca ou os filtros.': {
    en: 'Try clearing the search or filters.',
    es: 'Prueba a limpiar la búsqueda o los filtros.',
  },
  Hoje: {
    en: 'Today',
    es: 'Hoy',
  },
  Confirmados: {
    en: 'Going',
    es: 'Confirmados',
  },
  Interessados: {
    en: 'Interested',
    es: 'Interesados',
  },
  Interessado: {
    en: 'Interested',
    es: 'Interesado',
  },
  Passados: {
    en: 'Past',
    es: 'Pasados',
  },
  'Criados por mim': {
    en: 'Created by me',
    es: 'Creados por mí',
  },
  'Meus eventos': {
    en: 'My events',
    es: 'Mis eventos',
  },
  'Nenhum evento marcado aqui ainda.': {
    en: 'No events saved here yet.',
    es: 'Aún no hay eventos guardados aquí.',
  },
  'Nenhum evento marcado por aqui ainda.': {
    en: 'No events saved here yet.',
    es: 'Aún no hay eventos guardados aquí.',
  },
  'Você ainda não criou nenhum evento.': {
    en: "You haven't created any events yet.",
    es: 'Aún no has creado ningún evento.',
  },
  'Veja abaixo lugares para ir ou crie um evento no botão +.': {
    en: 'Find places below or create an event with the + button.',
    es: 'Encuentra lugares abajo o crea un evento con el botón +.',
  },
  'Criar evento': {
    en: 'Create event',
    es: 'Crear evento',
  },
  'Evento enviado ✅': {
    en: 'Event submitted ✅',
    es: 'Evento enviado ✅',
  },
  'Evento publicado! 🎉': {
    en: 'Event published! 🎉',
    es: '¡Evento publicado! 🎉',
  },
  'Já aparece na busca pra todo mundo.': {
    en: "It's now visible to everyone in search.",
    es: 'Ya aparece para todos en la búsqueda.',
  },
  'Diga se o evento é de um estabelecimento comercial ou pessoal.': {
    en: 'Choose whether this is a business or personal event.',
    es: 'Indica si es un evento comercial o personal.',
  },
  'Dê um nome ao evento e escolha pelo menos um gênero musical.': {
    en: 'Name your event and choose at least one music genre.',
    es: 'Ponle nombre al evento y elige al menos un género musical.',
  },
  'Preencha nome, CEP e aguarde o endereço ser localizado.': {
    en: 'Enter a name and postal code, then wait for the address lookup.',
    es: 'Introduce el nombre y código postal y espera a que se encuentre la dirección.',
  },
  'Não foi possível criar o evento.': {
    en: 'Could not create the event.',
    es: 'No se pudo crear el evento.',
  },
  'Este evento é de...': {
    en: 'This event is hosted by...',
    es: 'Este evento es de...',
  },
  'Estabelecimento comercial': {
    en: 'Business',
    es: 'Establecimiento comercial',
  },
  'Pessoa física': {
    en: 'Individual',
    es: 'Persona física',
  },
  'Buscar local existente...': {
    en: 'Search existing venues...',
    es: 'Buscar un lugar existente...',
  },
  'Buscando...': {
    en: 'Searching...',
    es: 'Buscando...',
  },
  'Não achou?': {
    en: "Can't find it?",
    es: '¿No lo encontraste?',
  },
  'Cadastrar novo local': {
    en: 'Add a new venue',
    es: 'Registrar un lugar nuevo',
  },
  'Nome do local': {
    en: 'Venue name',
    es: 'Nombre del lugar',
  },
  'Buscando endereço...': {
    en: 'Looking up address...',
    es: 'Buscando dirección...',
  },
  'CEP não encontrado.': {
    en: 'Postal code not found.',
    es: 'Código postal no encontrado.',
  },
  'Nome do evento': {
    en: 'Event name',
    es: 'Nombre del evento',
  },
  Descrição: {
    en: 'Description',
    es: 'Descripción',
  },
  'Gêneros musicais': {
    en: 'Music genres',
    es: 'Géneros musicales',
  },
  'Data e hora': {
    en: 'Date and time',
    es: 'Fecha y hora',
  },
  'Capa (opcional)': {
    en: 'Cover image (optional)',
    es: 'Portada (opcional)',
  },
  'Escolher imagem': {
    en: 'Choose image',
    es: 'Elegir imagen',
  },
  'Validar CNPJ': {
    en: 'Verify CNPJ',
    es: 'Validar CNPJ',
  },
  'Análise do contrato social': {
    en: 'Business document review',
    es: 'Revisión del documento comercial',
  },
  'Anexar contrato social (PDF ou foto, até 2,5 MB)': {
    en: 'Attach business document (PDF or photo, up to 2.5 MB)',
    es: 'Adjuntar documento comercial (PDF o foto, hasta 2,5 MB)',
  },
  'Enviando contrato social...': {
    en: 'Uploading business document...',
    es: 'Enviando documento comercial...',
  },
  'Consultando o CNPJ na Receita...': {
    en: 'Checking the official CNPJ registry...',
    es: 'Consultando el registro oficial de CNPJ...',
  },
  'Lendo o contrato com IA...': {
    en: 'Reading the document with AI...',
    es: 'Leyendo el documento con IA...',
  },
  'Conferindo razão social e sócios...': {
    en: 'Checking company name and partners...',
    es: 'Verificando la razón social y los socios...',
  },
  'Não foi possível enviar o contrato social.': {
    en: 'Could not submit the business document.',
    es: 'No se pudo enviar el documento comercial.',
  },
  'O arquivo precisa ter no máximo 2,5 MB.': {
    en: 'The file must be no larger than 2.5 MB.',
    es: 'El archivo debe tener como máximo 2,5 MB.',
  },
  Local: {
    en: 'Venue',
    es: 'Lugar',
  },
  Sobre: {
    en: 'About',
    es: 'Acerca de',
  },
  'Sobre o local': {
    en: 'About the venue',
    es: 'Sobre el lugar',
  },
  'Quem vai': {
    en: "Who's going",
    es: 'Quién va',
  },
  Benefícios: {
    en: 'Benefits',
    es: 'Beneficios',
  },
  'Eu vou': {
    en: "I'm going",
    es: 'Voy',
  },
  'Tenho interesse': {
    en: "I'm interested",
    es: 'Me interesa',
  },
  'Quero ir': {
    en: 'I want to go',
    es: 'Quiero ir',
  },
  Compartilhar: {
    en: 'Share',
    es: 'Compartir',
  },
  'Link copiado': {
    en: 'Link copied',
    es: 'Enlace copiado',
  },
  Favoritar: {
    en: 'Add to favorites',
    es: 'Añadir a favoritos',
  },
  'Favoritar local': {
    en: 'Favorite venue',
    es: 'Guardar lugar en favoritos',
  },
  Denunciar: {
    en: 'Report',
    es: 'Denunciar',
  },
  'Denunciar evento': {
    en: 'Report event',
    es: 'Denunciar evento',
  },
  'Denunciar pessoa': {
    en: 'Report person',
    es: 'Denunciar persona',
  },
  'Enviar denúncia': {
    en: 'Submit report',
    es: 'Enviar denuncia',
  },
  'Detalhes (opcional)': {
    en: 'Details (optional)',
    es: 'Detalles (opcional)',
  },
  'Fraude / evento falso': {
    en: 'Fraud / fake event',
    es: 'Fraude / evento falso',
  },
  'Comportamento inadequado': {
    en: 'Inappropriate behavior',
    es: 'Comportamiento inapropiado',
  },
  Assédio: {
    en: 'Harassment',
    es: 'Acoso',
  },
  'Perfil falso': {
    en: 'Fake profile',
    es: 'Perfil falso',
  },
  'Denúncia enviada. Obrigado por ajudar a manter o BORA confiável.': {
    en: 'Report submitted. Thanks for helping keep BORA trustworthy.',
    es: 'Denuncia enviada. Gracias por ayudar a mantener BORA confiable.',
  },
  'Não foi possível enviar a denúncia.': {
    en: 'Could not submit your report.',
    es: 'No se pudo enviar la denuncia.',
  },
  'Nenhum evento por aqui ainda.': {
    en: 'No events here yet.',
    es: 'Aún no hay eventos aquí.',
  },
  'Vai rolar algo? Crie o primeiro evento neste lugar.': {
    en: 'Got something planned? Create the first event at this venue.',
    es: '¿Tienes algo planeado? Crea el primer evento en este lugar.',
  },
  'Seja o primeiro a demonstrar interesse.': {
    en: 'Be the first to show interest.',
    es: 'Sé el primero en mostrar interés.',
  },
  'Nenhum benefício disponível para este evento.': {
    en: 'No benefits available for this event.',
    es: 'No hay beneficios disponibles para este evento.',
  },
  Resgatado: {
    en: 'Redeemed',
    es: 'Canjeado',
  },
  Resgatar: {
    en: 'Redeem',
    es: 'Canjear',
  },
  'Resgatando...': {
    en: 'Redeeming...',
    es: 'Canjeando...',
  },
  Esgotado: {
    en: 'Sold out',
    es: 'Agotado',
  },
  Válido: {
    en: 'Valid',
    es: 'Válido',
  },
  'Não foi possível resgatar agora.': {
    en: 'Could not redeem right now.',
    es: 'No se pudo canjear ahora.',
  },
  'Ninguém fez check-in ainda.': {
    en: 'No one has checked in yet.',
    es: 'Aún nadie ha hecho check-in.',
  },
  'Não foi possível carregar as mensagens.': {
    en: 'Could not load messages.',
    es: 'No se pudieron cargar los mensajes.',
  },
  'Não foi possível enviar a mensagem.': {
    en: 'Could not send your message.',
    es: 'No se pudo enviar el mensaje.',
  },
  'Escrever mensagem...': {
    en: 'Write a message...',
    es: 'Escribir mensaje...',
  },
  Enviar: {
    en: 'Send',
    es: 'Enviar',
  },
  'Enviando...': {
    en: 'Sending...',
    es: 'Enviando...',
  },
  Bloquear: {
    en: 'Block',
    es: 'Bloquear',
  },
  'Você bloqueou essa pessoa — as mensagens dela não aparecem mais.': {
    en: 'You blocked this person. Their messages are now hidden.',
    es: 'Bloqueaste a esta persona. Sus mensajes ya no aparecen.',
  },
  'Ir para check-in': {
    en: 'Go to check-in',
    es: 'Ir al check-in',
  },
  'Faça seu check-in': {
    en: 'Check in',
    es: 'Haz tu check-in',
  },
  'Escaneie o QR Code': {
    en: 'Scan the QR code',
    es: 'Escanea el código QR',
  },
  'Escaneie o QR Code do estabelecimento.': {
    en: "Scan the venue's QR code.",
    es: 'Escanea el código QR del establecimiento.',
  },
  'Código válido por 30 segundos': {
    en: 'Code valid for 30 seconds',
    es: 'Código válido por 30 segundos',
  },
  'Inserir código manualmente': {
    en: 'Enter code manually',
    es: 'Introducir código manualmente',
  },
  'Confirmando...': {
    en: 'Confirming...',
    es: 'Confirmando...',
  },
  'Não foi possível confirmar o check-in.': {
    en: 'Could not confirm check-in.',
    es: 'No se pudo confirmar el check-in.',
  },
  'Check-in confirmado': {
    en: 'Check-in confirmed',
    es: 'Check-in confirmado',
  },
  'Aproveitar a experiência': {
    en: 'Enjoy the experience',
    es: 'Disfrutar la experiencia',
  },
  'Benefício liberado': {
    en: 'Benefit unlocked',
    es: 'Beneficio desbloqueado',
  },
  'Benefício BORA': {
    en: 'BORA benefit',
    es: 'Beneficio BORA',
  },
  'Quem você gostaria de encontrar novamente?': {
    en: 'Who would you like to meet again?',
    es: '¿A quién te gustaría volver a ver?',
  },
  'Se a pessoa também demonstrar interesse em você, o chat é liberado automaticamente.': {
    en: 'If they are also interested in you, the chat opens automatically.',
    es: 'Si esa persona también muestra interés, el chat se habilita automáticamente.',
  },
  'Se houver interesse mútuo, o chat é liberado automaticamente.': {
    en: "If there's mutual interest, the chat opens automatically.",
    es: 'Si hay interés mutuo, el chat se habilita automáticamente.',
  },
  'Enviar interesse': {
    en: 'Send interest',
    es: 'Enviar interés',
  },
  'Interesse enviado': {
    en: 'Interest sent',
    es: 'Interés enviado',
  },
  'Ver conexões': {
    en: 'View connections',
    es: 'Ver conexiones',
  },
  Conexões: {
    en: 'Connections',
    es: 'Conexiones',
  },
  'O interesse foi mútuo — o chat já está liberado.': {
    en: "It's mutual. Your chat is ready.",
    es: 'El interés fue mutuo. El chat ya está disponible.',
  },
  'Deu Bora com': {
    en: 'You matched with',
    es: 'Hiciste match con',
  },
  Notificações: {
    en: 'Notifications',
    es: 'Notificaciones',
  },
  'Nenhuma notificação por enquanto': {
    en: 'No notifications yet',
    es: 'Aún no hay notificaciones',
  },
  'Editar perfil': {
    en: 'Edit profile',
    es: 'Editar perfil',
  },
  'Minhas preferências': {
    en: 'My preferences',
    es: 'Mis preferencias',
  },
  Pagamentos: {
    en: 'Payments',
    es: 'Pagos',
  },
  Configurações: {
    en: 'Settings',
    es: 'Configuración',
  },
  Segurança: {
    en: 'Security',
    es: 'Seguridad',
  },
  Suporte: {
    en: 'Support',
    es: 'Soporte',
  },
  Sair: {
    en: 'Sign out',
    es: 'Cerrar sesión',
  },
  Visitante: {
    en: 'Guest',
    es: 'Visitante',
  },
  'Trocar foto': {
    en: 'Change photo',
    es: 'Cambiar foto',
  },
  Salvar: {
    en: 'Save',
    es: 'Guardar',
  },
  'Não foi possível salvar.': {
    en: 'Could not save.',
    es: 'No se pudo guardar.',
  },
  'Não foi possível processar essa foto.': {
    en: 'Could not process this photo.',
    es: 'No se pudo procesar esta foto.',
  },
  'Não foi possível processar essa imagem.': {
    en: 'Could not process this image.',
    es: 'No se pudo procesar esta imagen.',
  },
  'Aparecer em "Quem vai"': {
    en: 'Show in "Who\'s going"',
    es: 'Aparecer en "Quién va"',
  },
  'Outras pessoas confirmadas no mesmo evento veem seu nome e foto na aba Quem Vai.': {
    en: "Other people going to the same event see your name and photo in Who's going.",
    es: 'Otras personas confirmadas en el mismo evento ven tu nombre y foto en Quién va.',
  },
  Localização: {
    en: 'Location',
    es: 'Ubicación',
  },
  'Trocar senha': {
    en: 'Change password',
    es: 'Cambiar contraseña',
  },
  'Senha atual': {
    en: 'Current password',
    es: 'Contraseña actual',
  },
  'Nova senha': {
    en: 'New password',
    es: 'Nueva contraseña',
  },
  'Senha alterada.': {
    en: 'Password changed.',
    es: 'Contraseña cambiada.',
  },
  'Não foi possível trocar a senha.': {
    en: 'Could not change your password.',
    es: 'No se pudo cambiar la contraseña.',
  },
  'Verificação de identidade': {
    en: 'Identity verification',
    es: 'Verificación de identidad',
  },
  'Verificar identidade': {
    en: 'Verify identity',
    es: 'Verificar identidad',
  },
  'Identidade verificada. Seus eventos publicam na hora.': {
    en: 'Identity verified. Your events are published instantly.',
    es: 'Identidad verificada. Tus eventos se publican al instante.',
  },
  'Tirar selfie': {
    en: 'Take selfie',
    es: 'Tomar selfie',
  },
  'Não foi possível verificar sua identidade.': {
    en: 'Could not verify your identity.',
    es: 'No se pudo verificar tu identidad.',
  },
  'Excluir conta': {
    en: 'Delete account',
    es: 'Eliminar cuenta',
  },
  'Excluir minha conta': {
    en: 'Delete my account',
    es: 'Eliminar mi cuenta',
  },
  'Seus dados são removidos do BORA. Essa ação não pode ser desfeita.': {
    en: 'Your data will be removed from BORA. This action cannot be undone.',
    es: 'Tus datos se eliminarán de BORA. Esta acción no se puede deshacer.',
  },
  'Tem certeza? Isso não pode ser desfeito.': {
    en: 'Are you sure? This cannot be undone.',
    es: '¿Estás seguro? Esto no se puede deshacer.',
  },
  'Confirmar exclusão': {
    en: 'Confirm deletion',
    es: 'Confirmar eliminación',
  },
  'Excluindo...': {
    en: 'Deleting...',
    es: 'Eliminando...',
  },
  'Não foi possível excluir a conta.': {
    en: 'Could not delete your account.',
    es: 'No se pudo eliminar la cuenta.',
  },
  'Plano atual': {
    en: 'Current plan',
    es: 'Plan actual',
  },
  Assinatura: {
    en: 'Subscription',
    es: 'Suscripción',
  },
  'Ajuda e suporte': {
    en: 'Help and support',
    es: 'Ayuda y soporte',
  },
  'Perguntas frequentes': {
    en: 'Frequently asked questions',
    es: 'Preguntas frecuentes',
  },
  'Como faço check-in num evento?': {
    en: 'How do I check in to an event?',
    es: '¿Cómo hago check-in en un evento?',
  },
  'Quem vê que eu confirmei presença?': {
    en: "Who can see that I'm going?",
    es: '¿Quién ve que confirmé mi asistencia?',
  },
  'Vá em Perfil → Segurança → Excluir conta.': {
    en: 'Go to Profile → Security → Delete account.',
    es: 'Ve a Perfil → Seguridad → Eliminar cuenta.',
  },
  'Selecione o estado': {
    en: 'Select state',
    es: 'Selecciona el estado',
  },
  'Selecione a cidade': {
    en: 'Select city',
    es: 'Selecciona la ciudad',
  },
  'Carregando cidades...': {
    en: 'Loading cities...',
    es: 'Cargando ciudades...',
  },
  'Não foi possível carregar os estados.': {
    en: 'Could not load states.',
    es: 'No se pudieron cargar los estados.',
  },
  'Não foi possível carregar as cidades.': {
    en: 'Could not load cities.',
    es: 'No se pudieron cargar las ciudades.',
  },
  'Não foi possível carregar as localidades do IBGE.': {
    en: 'Could not load IBGE locations.',
    es: 'No se pudieron cargar las localidades del IBGE.',
  },
  'Localizando...': {
    en: 'Locating...',
    es: 'Localizando...',
  },
  'Localização atual definida': {
    en: 'Current location set',
    es: 'Ubicación actual definida',
  },
  'Usar minha localização atual': {
    en: 'Use my current location',
    es: 'Usar mi ubicación actual',
  },
  'Usada para mostrar o que está perto de você.': {
    en: "Used to show what's nearby.",
    es: 'Se usa para mostrar lo que hay cerca de ti.',
  },
  'Salvar localização': {
    en: 'Save location',
    es: 'Guardar ubicación',
  },
  'Não conseguimos identificar sua cidade. Selecione estado e cidade na lista.': {
    en: "We couldn't identify your city. Select your state and city from the list.",
    es: 'No pudimos identificar tu ciudad. Selecciona el estado y la ciudad en la lista.',
  },
  'Não foi possível obter sua localização. Verifique a permissão do navegador.': {
    en: "Could not get your location. Check your browser's permissions.",
    es: 'No se pudo obtener tu ubicación. Revisa los permisos del navegador.',
  },
  'Seu navegador não permite acessar a localização.': {
    en: "Your browser doesn't allow location access.",
    es: 'Tu navegador no permite acceder a la ubicación.',
  },
  'Sem sua localização, a lista não é ordenada pela distância.': {
    en: "Without your location, the list isn't sorted by distance.",
    es: 'Sin tu ubicación, la lista no se ordena por distancia.',
  },
  'Carregando mapa...': {
    en: 'Loading map...',
    es: 'Cargando mapa...',
  },
  'Localização aproximada. Confirme o acesso pelo endereço.': {
    en: 'Approximate location. Check the address before visiting.',
    es: 'Ubicación aproximada. Confirma el acceso con la dirección.',
  },
  'Abrir no Google Maps': {
    en: 'Open in Google Maps',
    es: 'Abrir en Google Maps',
  },
  'Instagram do local': {
    en: 'Venue Instagram',
    es: 'Instagram del lugar',
  },
  'Fonte e créditos da foto': {
    en: 'Photo source and credits',
    es: 'Fuente y créditos de la foto',
  },
  'Horários:': {
    en: 'Hours:',
    es: 'Horarios:',
  },
  Estimativa: {
    en: 'Estimate',
    es: 'Estimación',
  },
  Preço: {
    en: 'Price',
    es: 'Precio',
  },
  'Bares, pubs e botecos': {
    en: 'Bars, pubs and taverns',
    es: 'Bares, pubs y tabernas',
  },
  'Baladas e casas noturnas': {
    en: 'Clubs and nightlife',
    es: 'Discotecas y clubes nocturnos',
  },
  'Samba, pagode e música ao vivo': {
    en: 'Samba, pagode and live music',
    es: 'Samba, pagode y música en vivo',
  },
  'Beach clubs e quiosques': {
    en: 'Beach clubs and kiosks',
    es: 'Clubes de playa y quioscos',
  },
  'Bares com vista e rooftops': {
    en: 'Scenic bars and rooftops',
    es: 'Bares con vistas y azoteas',
  },
  Restaurantes: {
    en: 'Restaurants',
    es: 'Restaurantes',
  },
  'Museus, cultura e história': {
    en: 'Museums, culture and history',
    es: 'Museos, cultura e historia',
  },
  'Parques e atrações familiares': {
    en: 'Parks and family attractions',
    es: 'Parques y atracciones familiares',
  },
  'Mirantes, trilhas e aventura': {
    en: 'Viewpoints, trails and adventure',
    es: 'Miradores, senderos y aventura',
  },
  'Procurar lugar': {
    en: 'Find a place',
    es: 'Buscar un lugar',
  },
  'Procurar evento': {
    en: 'Find an event',
    es: 'Buscar un evento',
  },
  'Chamar um amigo': {
    en: 'Invite a friend',
    es: 'Invitar a un amigo',
  },
  Seguir: {
    en: 'Follow',
    es: 'Seguir',
  },
  Seguindo: {
    en: 'Following',
    es: 'Siguiendo',
  },
  'Um lugar incrível esperando por você.': {
    en: 'An amazing place waiting for you.',
    es: 'Un lugar increíble te espera.',
  },
  'BORA — início da página': {
    en: 'BORA — top of page',
    es: 'BORA — inicio de la página',
  },
  'Onde ir. Com quem ir.': {
    en: 'Where to go. Who to go with.',
    es: 'Adónde ir. Con quién ir.',
  },
  'Mais vida fora': {
    en: 'More life beyond',
    es: 'Más vida fuera',
  },
  'incríveis.': {
    en: 'amazing.',
    es: 'increíbles.',
  },
  'do óbvio.': {
    en: 'the ordinary.',
    es: 'de lo obvio.',
  },
  'Criar minha conta': {
    en: 'Create my account',
    es: 'Crear mi cuenta',
  },
  'Já tenho conta': {
    en: 'I already have an account',
    es: 'Ya tengo cuenta',
  },
  'lugares na primeira leva': {
    en: 'places in the first release',
    es: 'lugares en la primera edición',
  },
  'BORA Score do rolê mais quente': {
    en: 'BORA Score of the hottest event',
    es: 'BORA Score del evento más popular',
  },
  lugares: {
    en: 'places',
    es: 'lugares',
  },
  confirmaram: {
    en: 'confirmed',
    es: 'confirmaron',
  },
  disponíveis: {
    en: 'available',
    es: 'disponibles',
  },
  '· validado': {
    en: '· verified',
    es: '· validado',
  },
  'em análise': {
    en: 'under review',
    es: 'en revisión',
  },
  'combina com você': {
    en: 'matches your vibe',
    es: 'va contigo',
  },
  '+36 confirmaram': {
    en: '+36 confirmed',
    es: '+36 confirmaron',
  },
  '120 confirmados': {
    en: '120 confirmed',
    es: '120 confirmados',
  },
  '2 drinks até 21h': {
    en: '2 drinks until 9 pm',
    es: '2 bebidas hasta las 21 h',
  },
  '18h – 02h': {
    en: '6 pm – 2 am',
    es: '18 h – 02 h',
  },
  'Do “não sei o que fazer hoje” até o rolê acontecer.': {
    en: 'From "I don\'t know what to do today" to making it happen.',
    es: 'De «no sé qué hacer hoy» a vivir la experiencia.',
  },
  'O que tem pra fazer': {
    en: 'Things to do',
    es: 'Qué hay para hacer',
  },
  'Da roda de samba no Vidigal ao rooftop na Barra.': {
    en: 'From samba in Vidigal to rooftops in Barra.',
    es: 'De la samba en Vidigal a las azoteas de Barra.',
  },
  'Por que esse rolê e não outro': {
    en: 'Why this event is right for you',
    es: 'Por qué este evento va contigo',
  },
  'Um número que diz o quanto aquilo combina com você.': {
    en: 'A number that shows how well it matches your vibe.',
    es: 'Un número que indica cuánto va contigo.',
  },
  'O estilo de música que toca lá': {
    en: 'The music played there',
    es: 'La música que suena allí',
  },
  'O tipo de ambiente que você curte': {
    en: 'The atmosphere you enjoy',
    es: 'El ambiente que te gusta',
  },
  'A faixa etária de quem vai estar': {
    en: 'The age range of the crowd',
    es: 'El rango de edad del público',
  },
  'A distância até você': {
    en: 'The distance from you',
    es: 'La distancia desde ti',
  },
  'A faixa de preço do lugar': {
    en: "The venue's price range",
    es: 'El rango de precios del lugar',
  },
  'A intenção que você marcou pra hoje': {
    en: 'What you want to do today',
    es: 'Lo que quieres hacer hoy',
  },
  'O app é de graça. O': {
    en: 'The app is free. The',
    es: 'La aplicación es gratis. El',
  },
  'é pra quem sai de verdade.': {
    en: 'is for those who love going out.',
    es: 'es para quienes disfrutan salir.',
  },
  'Receba benefícios': {
    en: 'Get benefits',
    es: 'Recibe beneficios',
  },
  'Faça check-in': {
    en: 'Check in',
    es: 'Haz check-in',
  },
  'Participe de experiências': {
    en: 'Join experiences',
    es: 'Participa en experiencias',
  },
  'Começar de graça': {
    en: 'Start for free',
    es: 'Empezar gratis',
  },
  'De graça, direto no navegador — sem passar por loja de aplicativo.': {
    en: 'Free, right in your browser. No app store required.',
    es: 'Gratis, directamente en tu navegador, sin tienda de aplicaciones.',
  },
  'O que todo mundo pergunta antes de criar a conta.': {
    en: 'What everyone asks before signing up.',
    es: 'Lo que todos preguntan antes de crear una cuenta.',
  },
  'O BORA é um aplicativo de relacionamento?': {
    en: 'Is BORA a dating app?',
    es: '¿BORA es una aplicación de citas?',
  },
  'O BORA é pago?': {
    en: 'Does BORA cost money?',
    es: '¿BORA es de pago?',
  },
  'Preciso baixar na loja de aplicativos?': {
    en: 'Do I need to download it from an app store?',
    es: '¿Necesito descargarla de una tienda de aplicaciones?',
  },
  'Como funciona o check-in?': {
    en: 'How does check-in work?',
    es: '¿Cómo funciona el check-in?',
  },
  'Quem consegue ver que eu vou a um evento?': {
    en: "Who can see that I'm going to an event?",
    es: '¿Quién puede ver que iré a un evento?',
  },
  'E os benefícios dos lugares, como pego?': {
    en: 'How do I get venue benefits?',
    es: '¿Cómo obtengo los beneficios de los lugares?',
  },
  'Em qual cidade funciona?': {
    en: 'Which city is it available in?',
    es: '¿En qué ciudad funciona?',
  },
  'Tem idade mínima?': {
    en: 'Is there a minimum age?',
    es: '¿Hay edad mínima?',
  },
  'Deu Bora — interesse mútuo depois de um evento.': {
    en: 'Deu BORA — mutual interest after an event.',
    es: 'Deu BORA: interés mutuo después de un evento.',
  },
  'Desenvolvido pela': {
    en: 'Developed by',
    es: 'Desarrollado por',
  },
  '— soluções em tecnologia para um futuro mais eficiente.': {
    en: '— technology solutions for a more efficient future.',
    es: '— soluciones tecnológicas para un futuro más eficiente.',
  },
  'Acesso exclusivo de administradores.': {
    en: 'Administrator access only.',
    es: 'Acceso exclusivo para administradores.',
  },
  'Você não pode remover seu próprio acesso administrativo.': {
    en: 'You cannot remove your own administrator access.',
    es: 'No puedes quitar tu propio acceso de administrador.',
  },
  'Este evento já foi revisado. Atualize a lista.': {
    en: 'This event has already been reviewed. Refresh the list.',
    es: 'Este evento ya fue revisado. Actualiza la lista.',
  },
  'Este cadastro já foi revisado.': {
    en: 'This registration has already been reviewed.',
    es: 'Este registro ya fue revisado.',
  },
  'O início deve ser anterior ao fim.': {
    en: 'The start date must be before the end date.',
    es: 'La fecha inicial debe ser anterior a la final.',
  },
  'Sem cidade': {
    en: 'No city',
    es: 'Sin ciudad',
  },
  Norte: {
    en: 'North',
    es: 'Norte',
  },
  Nordeste: {
    en: 'Northeast',
    es: 'Nordeste',
  },
  'Centro-Oeste': {
    en: 'Central-West',
    es: 'Centro-Oeste',
  },
  Sudeste: {
    en: 'Southeast',
    es: 'Sudeste',
  },
  Sul: {
    en: 'South',
    es: 'Sur',
  },
  'Precisamos da sua idade, telefone e localização pra calcular o BORA Score e mostrar o que está perto de você.': {
    en: "We need your age, phone and location to calculate your BORA Score and show what's nearby.",
    es: 'Necesitamos tu edad, teléfono y ubicación para calcular tu BORA Score y mostrar lo que hay cerca.',
  },
  'Fica em análise até a validação do seu CNPJ ser aprovada — dá pra ver pelo link direto.': {
    en: 'It stays under review until your business registration is approved. View it using the direct link.',
    es: 'Queda en revisión hasta aprobar tu registro comercial. Puedes verlo mediante el enlace directo.',
  },
  'Ainda está em análise — dá pra ver pelo link direto, e ele aparece pra todo mundo assim que ganhar mais confiança (ex.: pessoas confirmando presença de verdade no local, ou você verificar sua identidade em Perfil > Segurança).':
    {
      en: 'Still under review. You can view it via the direct link. It becomes public after gaining trust through real check-ins or identity verification in Profile > Security.',
      es: 'Sigue en revisión. Puedes verlo mediante el enlace directo. Será público al ganar confianza con check-ins reales o al verificar tu identidad en Perfil > Seguridad.',
    },
  'Ponto comercial com CNPJ validado, local verificado ou você com identidade verificada (Perfil': {
    en: 'An approved business, a verified venue or a verified identity (Profile',
    es: 'Un comercio aprobado, un lugar verificado o tu identidad verificada (Perfil',
  },
  'Segurança) publicam na hora. Senão, o evento fica em análise até 3 check-ins reais confirmarem que é de verdade.': {
    en: 'Security) allows instant publishing. Otherwise, the event stays under review until approved or confirmed by 3 real check-ins.',
    es: 'Seguridad) permite publicar al instante. De lo contrario, el evento queda en revisión hasta ser aprobado o confirmado por 3 check-ins reales.',
  },
  'Pra publicar na hora, verifique sua identidade (telefone + CPF + selfie) em': {
    en: 'To publish instantly, verify your identity (phone + CPF + selfie) in',
    es: 'Para publicar al instante, verifica tu identidad (teléfono + CPF + selfie) en',
  },
  '. Sem isso, o evento fica em análise até 3 check-ins confirmarem que é real.': {
    en: '. Otherwise, the event stays under review until approved or confirmed by 3 real check-ins.',
    es: '. De lo contrario, el evento queda en revisión hasta ser aprobado o confirmado por 3 check-ins reales.',
  },
  'Só na primeira vez: informe o CNPJ e anexe o contrato social. Conferimos se o documento bate com o CNPJ e depois reaproveitamos nos próximos eventos.':
    {
      en: 'Only the first time: enter your CNPJ and attach your business document. We check that they match and reuse the verification for future events.',
      es: 'Solo la primera vez: informa el CNPJ y adjunta el documento comercial. Verificamos que coincidan y reutilizamos la validación en futuros eventos.',
    },
  'Sala temporária do evento — some do check-in que sobrar por 48h. Só quem tem interesse, confirmou ou fez check-in participa.':
    {
      en: 'Temporary event room, available for 48 hours after the last check-in. Only interested, confirmed or checked-in people can join.',
      es: 'Sala temporal del evento, disponible por 48 horas tras el último check-in. Solo participan personas interesadas, confirmadas o con check-in.',
    },
  'Você precisa demonstrar interesse, confirmar presença ou fazer check-in nesse evento pra entrar aqui.': {
    en: "Show interest, confirm you're going or check in to join this room.",
    es: 'Muestra interés, confirma tu asistencia o haz check-in para entrar aquí.',
  },
  'Nenhuma conexão ainda — dá bora num evento e, se rolar interesse mútuo depois, aparece aqui.': {
    en: 'No connections yet. Attend an event and mutual matches will appear here.',
    es: 'Aún no hay conexiones. Asiste a un evento y las coincidencias mutuas aparecerán aquí.',
  },
  'Em breve você vai receber avisos de BORA Relâmpago, compatibilidade e eventos salvos aqui.': {
    en: "Soon you'll receive BORA flash alerts, compatibility updates and saved-event news here.",
    es: 'Pronto recibirás avisos de BORA Relâmpago, compatibilidad y eventos guardados aquí.',
  },
  'Controlada pela permissão do navegador/sistema. Pra revogar, ajuste nas configurações de localização do seu dispositivo ou navegador — o BORA continua funcionando por cidade sem ela.':
    {
      en: 'Managed by your browser or system permissions. To revoke it, change your device or browser location settings. BORA still works using your city.',
      es: 'Se controla con los permisos del navegador o sistema. Para revocarla, cambia la configuración de ubicación del dispositivo o navegador. BORA sigue funcionando por ciudad.',
    },
  'Notificações push ainda não estão disponíveis nesta versão — em breve você poderá escolher quais tipos receber.': {
    en: "Push notifications aren't available in this version yet. Soon you'll be able to choose which ones to receive.",
    es: 'Las notificaciones push aún no están disponibles. Pronto podrás elegir cuáles recibir.',
  },
  'Se você entra pelo Google, sua conta não tem senha — essa troca só funciona pra quem cadastrou com e-mail.': {
    en: 'Google sign-in accounts have no password. This option is for accounts created with email.',
    es: 'Las cuentas de Google no tienen contraseña. Esta opción es para quienes se registraron con correo.',
  },
  'Telefone confirmado + CPF + uma selfie liberam publicar evento na hora, mesmo em local novo, sem esperar check-in de ninguém.':
    {
      en: 'A verified phone, CPF and selfie let you publish instantly, even at a new venue, without waiting for check-ins.',
      es: 'Un teléfono verificado, CPF y selfie permiten publicar al instante, incluso en un lugar nuevo, sin esperar check-ins.',
    },
  'Cobrança automática ainda não está disponível nesta versão — quando o BORA Club estiver com pagamento ativo, seu método de pagamento e histórico de cobranças aparecem aqui.':
    {
      en: "Automatic billing isn't available yet. When BORA Club payments launch, your payment method and billing history will appear here.",
      es: 'El cobro automático aún no está disponible. Cuando se activen los pagos de BORA Club, aquí aparecerán tu método de pago e historial.',
    },
  'Na tela do evento, confirme presença em "Eu vou" e, ao chegar no local, escaneie o QR Code exibido pelo estabelecimento.':
    {
      en: 'On the event page, tap "I\'m going". At the venue, scan the QR code displayed there.',
      es: 'En la página del evento, confirma en "Voy". Al llegar, escanea el código QR del establecimiento.',
    },
  'Só quem também confirmou ou está interessado no mesmo evento, e apenas se você deixar "Aparecer em Quem Vai" ativado nas Configurações.':
    {
      en: 'Only people going to or interested in the same event, and only if "Show in Who\'s going" is enabled in Settings.',
      es: 'Solo quienes confirmaron o mostraron interés en el mismo evento, y solo si activaste "Aparecer en Quién va" en Configuración.',
    },
  'Não. O modo gratuito permite descobrir lugares e eventos, confirmar presença e fazer check-in. O BORA Club é opcional.':
    {
      en: 'The free plan lets you discover places and events, confirm attendance and check in. BORA Club is optional.',
      es: 'El plan gratuito permite descubrir lugares y eventos, confirmar asistencia y hacer check-in. BORA Club es opcional.',
    },
  'Canal direto de suporte (WhatsApp/e-mail) ainda não configurado — assim que houver um contato oficial, ele aparece aqui.':
    {
      en: "Direct support via WhatsApp or email isn't set up yet. Official contact details will appear here when available.",
      es: 'El soporte por WhatsApp o correo aún no está configurado. El contacto oficial aparecerá aquí cuando esté disponible.',
    },
  'Cidade salva, mas não achamos ela no mapa. Use "Usar minha localização atual".': {
    en: 'City saved, but we couldn\'t find it on the map. Choose "Use my current location".',
    es: 'Ciudad guardada, pero no la encontramos en el mapa. Elige "Usar mi ubicación actual".',
  },
  'Perfil salvo, mas não achamos essa cidade no mapa. Use "Usar minha localização atual".': {
    en: 'Profile saved, but we couldn\'t find this city on the map. Choose "Use my current location".',
    es: 'Perfil guardado, pero no encontramos la ciudad en el mapa. Elige "Usar mi ubicación actual".',
  },
  'Bares, festas, rooftops e praia — e, antes de sair de casa, quem já confirmou que vai estar lá.': {
    en: "Bars, parties, rooftops and beaches. Before leaving home, see who's already going.",
    es: 'Bares, fiestas, azoteas y playa. Antes de salir de casa, descubre quién ya confirmó que irá.',
  },
  'Diga o que você quer fazer hoje — beber, dançar, jantar, praia — e veja o que está rolando perto de você, hoje à noite.':
    {
      en: "Tell us what you'd like to do: drinks, dancing, dinner or the beach. See what's happening nearby tonight.",
      es: 'Dinos qué quieres hacer: tomar algo, bailar, cenar o ir a la playa. Descubre qué pasa cerca esta noche.',
    },
  'Antes de ir, veja quem também confirmou presença. Não é lista de nomes: são pessoas com interesse parecido com o seu.':
    {
      en: 'Before you go, see who else is going. Meet people with interests like yours.',
      es: 'Antes de ir, mira quién más confirmó. Conoce personas con intereses como los tuyos.',
    },
  'Confirme presença, chegue no local e faça o check-in pelo QR Code do estabelecimento. Benefício liberado na hora.': {
    en: "Confirm you're going, arrive and scan the venue's QR code to check in. Unlock your benefit right away.",
    es: 'Confirma tu asistencia, llega al lugar y haz check-in con su código QR. Tu beneficio se habilita al instante.',
  },
  'Acabou o rolê, você escolhe quem quer rever. Se o interesse for mútuo, a conversa abre — e aí é com vocês.': {
    en: "After the event, choose who you'd like to see again. If the interest is mutual, a chat opens. The rest is up to you.",
    es: 'Después del evento, elige a quién quieres volver a ver. Si el interés es mutuo, se abre el chat. Lo demás depende de ustedes.',
  },
  'A primeira leva do BORA cobre bar, festa, rooftop, restaurante e praia — de econômico a premium, do Recreio à Lapa.':
    {
      en: "BORA's first release covers bars, parties, rooftops, restaurants and beaches, from budget to premium, from Recreio to Lapa.",
      es: 'La primera edición incluye bares, fiestas, azoteas, restaurantes y playas, de económico a premium, de Recreio a Lapa.',
    },
  'Todo evento no BORA carrega um score calculado pra você — não é média de estrelinha de desconhecido. Ele leva em conta:':
    {
      en: 'Every BORA event has a score calculated for you, based on what matters to you. It considers:',
      es: 'Cada evento tiene una puntuación calculada para ti, basada en lo que te importa. Tiene en cuenta:',
    },
  'Não. O ponto de partida é sempre o lugar. Depois do evento existe o "Deu BORA", mas ele só aparece entre pessoas que fizeram check-in no mesmo evento, e a conversa só abre se as duas se escolherem. É consequência de ter saído, não o objetivo do app.':
    {
      en: 'The experience starts with a place. After an event, Deu BORA lets people who checked in connect. A chat opens only if both choose each other.',
      es: 'La experiencia empieza por un lugar. Después del evento, Deu BORA permite conectar a quienes hicieron check-in. El chat solo se abre si ambos se eligen.',
    },
  'Não. O BORA abre direto no navegador e pode ser instalado na tela inicial do celular pelo menu do próprio navegador — sem App Store, sem Play Store, sem ocupar espaço de app tradicional.':
    {
      en: 'BORA opens in your browser. Add it to your home screen from the browser menu, without the App Store or Play Store.',
      es: 'BORA abre en tu navegador. Añádela a la pantalla de inicio desde el menú del navegador, sin App Store ni Play Store.',
    },
  'O estabelecimento mostra um QR Code que se renova a cada 30 segundos, e você escaneia pelo app. Esse código curto existe pra o check-in valer só pra quem está de fato no local — não dá pra alguém mandar um print pra outra pessoa fazer check-in de casa.':
    {
      en: "Scan the venue's QR code in the app. It refreshes every 30 seconds so check-in is intended for people physically at the venue.",
      es: 'Escanea el código QR del establecimiento. Se renueva cada 30 segundos para que el check-in corresponda a personas presentes en el lugar.',
    },
  'Na lista "Quem vai", as outras pessoas veem só o seu primeiro nome e a sua foto — não o nome completo, nem e-mail, telefone ou a sua localização. E dá pra sair da lista: nas Configurações existe uma chave para não aparecer em "Quem vai", e o app continua funcionando normalmente com ela desligada.':
    {
      en: "In Who's going, others see only your first name and photo. Your full name, email, phone and location stay private. Hide yourself from the list in Settings and keep using the app.",
      es: 'En Quién va, los demás solo ven tu primer nombre y foto. Tu nombre completo, correo, teléfono y ubicación son privados. Puedes ocultarte en Configuración y seguir usando la aplicación.',
    },
  'Cada evento pode ter um benefício do estabelecimento, tipo dois drinks até 21h. Ele é resgatado no app depois que você faz o check-in no local — check-in e resgate são coisas separadas, então o benefício não é queimado sem você querer.':
    {
      en: 'Events may offer venue benefits, like two drinks before 9 pm. Redeem them in the app after checking in. Check-in and redemption are separate, so you decide when to use a benefit.',
      es: 'Los eventos pueden ofrecer beneficios, como dos bebidas hasta las 21 h. Canjéalos en la aplicación después del check-in. Son acciones separadas: tú decides cuándo usarlos.',
    },
  'Rio de Janeiro. A primeira leva de lugares vai da Barra e do Recreio ao Vidigal, Leblon e Lapa — bar, festa, rooftop, restaurante e praia, do econômico ao premium.':
    {
      en: 'Rio de Janeiro. The first venues span Barra, Recreio, Vidigal, Leblon and Lapa: bars, parties, rooftops, restaurants and beaches, from budget to premium.',
      es: 'Río de Janeiro. Los primeros lugares van de Barra y Recreio a Vidigal, Leblon y Lapa: bares, fiestas, azoteas, restaurantes y playas, de económico a premium.',
    },
  'Sim: 18 anos completos. A data de nascimento é validada no cadastro, e ela também entra no cálculo do BORA Score — é por isso que o app mostra a faixa etária de quem costuma ir a cada lugar.':
    {
      en: 'Yes, you must be 18 or older. Your date of birth is validated at registration and helps calculate your BORA Score and age-range preferences.',
      es: 'Sí, debes tener 18 años. Tu fecha de nacimiento se valida al registrarte y ayuda a calcular tu BORA Score y las preferencias de edad.',
    },
  'É um cálculo de compatibilidade entre você e o lugar/evento, baseado em música, tipo de ambiente, faixa etária, distância, preço e suas intenções — não é uma nota de popularidade.':
    {
      en: 'A compatibility score between you and the venue or event, based on music, atmosphere, age range, distance, price and your plans.',
      es: 'Una puntuación de compatibilidad entre tú y el lugar o evento, basada en música, ambiente, edad, distancia, precio y tus planes.',
    },
  'Não foi possível ler a imagem.': {
    en: 'Could not read the image.',
    es: 'No se pudo leer la imagen.',
  },
  'Não foi possível ler o arquivo.': {
    en: 'Could not read the file.',
    es: 'No se pudo leer el archivo.',
  },
  'Canvas indisponível.': {
    en: 'Canvas unavailable.',
    es: 'Canvas no disponible.',
  },
  'Eventos ({count})': {
    en: 'Events ({count})',
    es: 'Eventos ({count})',
  },
  'Veja quem vai': {
    en: "See who's going",
    es: 'Mira quién va',
  },
  'Entre em grupos': {
    en: 'Join groups',
    es: 'Únete a grupos',
  },
  'E muito mais': {
    en: 'And much more',
    es: 'Y mucho más',
  },
  'O mundo acontece fora.': {
    en: 'Life happens out there.',
    es: 'La vida pasa afuera.',
  },
  'BORA. VIVER MAIS.': {
    en: 'BORA. LIVE MORE.',
    es: 'BORA. VIVE MÁS.',
  },
  'BORA?': {
    en: 'BORA?',
    es: '¿BORA?',
  },
  'Ver mais informações': {
    en: 'More information',
    es: 'Más información',
  },
  'do estabelecimento': {
    en: 'from the venue',
    es: 'del establecimiento',
  },
  'Configure VITE_GOOGLE_CLIENT_ID para habilitar o login com Google': {
    en: 'Configure VITE_GOOGLE_CLIENT_ID to enable Google sign-in',
    es: 'Configura VITE_GOOGLE_CLIENT_ID para habilitar el acceso con Google',
  },
  Outros: {
    en: 'Other',
    es: 'Otros',
  },
  Sofisticado: {
    en: 'Sophisticated',
    es: 'Sofisticado',
  },
  Casual: {
    en: 'Casual',
    es: 'Casual',
  },
  Animado: {
    en: 'Lively',
    es: 'Animado',
  },
  Tranquilo: {
    en: 'Relaxed',
    es: 'Tranquilo',
  },
  Balada: {
    en: 'Nightclub',
    es: 'Discoteca',
  },
  Praia: {
    en: 'Beach',
    es: 'Playa',
  },
  Restaurante: {
    en: 'Restaurant',
    es: 'Restaurante',
  },
  'Conta suspensa.': {
    en: 'Account suspended.',
    es: 'Cuenta suspendida.',
  },
  'Informe o CPF completo.': { en: 'Enter your full CPF.', es: 'Introduce tu CPF completo.' },
  'Informe o CNPJ completo.': { en: 'Enter your full CNPJ.', es: 'Introduce tu CNPJ completo.' },
  'Anexe o contrato social (PDF ou foto).': { en: 'Attach the articles of incorporation (PDF or photo).', es: 'Adjunta el contrato social (PDF o foto).' },
  'Preencha o CEP e aguarde o endereço ser localizado.': { en: 'Fill in the ZIP code and wait for the address to be found.', es: 'Completa el CEP y espera a que se localice la dirección.' },
  'Conta de estabelecimento': { en: 'Business account', es: 'Cuenta de establecimiento' },
  'Passo': { en: 'Step', es: 'Paso' },
  'de': { en: 'of', es: 'de' },
  'Voltar': { en: 'Back', es: 'Volver' },
  'Número': { en: 'Number', es: 'Número' },
  'Complemento': { en: 'Complement', es: 'Complemento' },
  'Nome do responsável': { en: 'Name of the responsible person', es: 'Nombre del responsable' },
  'E-mail do comércio': { en: 'Business email', es: 'Correo del comercio' },
  'Nome do estabelecimento': { en: 'Business name', es: 'Nombre del establecimiento' },
  'Criar conta de estabelecimento': { en: 'Create business account', es: 'Crear cuenta de establecimiento' },
  'Como você quer usar o Bora?': { en: 'How do you want to use Bora?', es: '¿Cómo quieres usar Bora?' },
  'Quero curtir eventos': { en: 'I want to enjoy events', es: 'Quiero disfrutar de eventos' },
  'Tenho um estabelecimento': { en: 'I have a business', es: 'Tengo un establecimiento' },
  'Descubra lugares, confirme presença e faça check-in.': { en: 'Discover places, confirm attendance and check in.', es: 'Descubre lugares, confirma asistencia y haz check-in.' },
  'Gerencie seu local, eventos e promoções.': { en: 'Manage your venue, events and promotions.', es: 'Gestiona tu local, eventos y promociones.' },
  'Use o e-mail e os dados do seu comércio. Esta conta serve só para administrar o seu estabelecimento. Para usar o Bora como pessoa, faça outro cadastro com outro e-mail.': { en: 'Use your business email and details. This account is only for managing your establishment. To use Bora as a person, sign up again with a different email.', es: 'Usa el correo y los datos de tu comercio. Esta cuenta sirve solo para administrar tu establecimiento. Para usar Bora como persona, regístrate de nuevo con otro correo.' },
  'Nenhuma promoção disponível para este evento.': { en: 'No promotions available for this event.', es: 'No hay promociones disponibles para este evento.' },
  'até': { en: 'until', es: 'hasta' },
  'das': { en: 'from', es: 'de' },
  'às': { en: 'to', es: 'a' },
  'Aponte a câmera do seu celular para o QR Code do estabelecimento.': { en: 'Point your phone camera at the QR Code of the establishment.', es: 'Apunta la cámara de tu celular al código QR del establecimiento.' },
  'Esse CPF já está associado a outra conta': { en: 'This CPF is already linked to another account', es: 'Este CPF ya está asociado a otra cuenta' },
  'Esse CNPJ já está cadastrado em outra conta': { en: 'This CNPJ is already registered to another account', es: 'Este CNPJ ya está registrado en otra cuenta' },
  'Contas de estabelecimento não podem usar esta função. Crie uma conta de usuário.': { en: 'Business accounts cannot use this feature. Create a user account.', es: 'Las cuentas de establecimiento no pueden usar esta función. Crea una cuenta de usuario.' },
  'Esta promoção não precisa de resgate: é só pedir no balcão.': { en: 'This promotion needs no redemption: just ask at the counter.', es: 'Esta promoción no necesita canje: solo pídela en el mostrador.' },
  'Sua sessão do Google expirou. Clique em "Continuar com Google" de novo.': { en: 'Your Google session expired. Click "Continue with Google" again.', es: 'Tu sesión de Google expiró. Haz clic en "Continuar con Google" de nuevo.' },
  'Sua conta Google {email} ainda não tem cadastro no Bora. Escolha o tipo de conta para continuar.': { en: 'Your Google account {email} is not registered on Bora yet. Choose the account type to continue.', es: 'Tu cuenta de Google {email} aún no está registrada en Bora. Elige el tipo de cuenta para continuar.' },
  'Acesso pela conta Google': { en: 'Access with your Google account', es: 'Acceso con tu cuenta de Google' },
  'Usar e-mail e senha': { en: 'Use email and password', es: 'Usar correo y contraseña' },
  'Essa conta Google ainda não tem cadastro no Bora.': { en: 'This Google account is not registered on Bora yet.', es: 'Esta cuenta de Google aún no está registrada en Bora.' },
  'Em breve': { en: 'Coming soon', es: 'Próximamente' },
  'Chega em breve. Por enquanto, tudo no BORA é de graça.': { en: 'Coming soon. For now, everything on BORA is free.', es: 'Llega pronto. Por ahora, todo en BORA es gratis.' },
  'Hoje, não. Criar conta, descobrir lugares, ver quem vai e fazer check-in são gratuitos. O BORA Club, plano de assinatura, chega em breve — por enquanto dá pra usar tudo sem pagar.': {
    en: "Not today. Creating an account, discovering places, seeing who's going and checking in are free. BORA Club, the subscription plan, is coming soon — for now you can use everything for free.",
    es: 'Hoy no. Crear cuenta, descubrir lugares, ver quién va y hacer check-in es gratis. BORA Club, el plan de suscripción, llega pronto: por ahora puedes usar todo sin pagar.',
  },
  'grátis pra usar': { en: 'free to use', es: 'gratis para usar' },
  'Esse Google já tem uma conta de usuário no Bora. Use outro e-mail para o comércio.': { en: 'This Google account already has a user account on Bora. Use a different email for the business.', es: 'Esta cuenta de Google ya tiene una cuenta de usuario en Bora. Usa otro correo para el comercio.' },
  'E-mail verificado': { en: 'Email verified', es: 'Correo verificado' },
  'E-mail não verificado': { en: 'Email not verified', es: 'Correo sin verificar' },
  'Confirme seu e-mail': { en: 'Confirm your email', es: 'Confirma tu correo' },
  'Reenviar em {seconds}s': { en: 'Resend in {seconds}s', es: 'Reenviar en {seconds}s' },
  'Código de teste': { en: 'Test code', es: 'Código de prueba' },
  'Dígito': { en: 'Digit', es: 'Dígito' },
  'Não foi possível enviar o e-mail. Tente novamente em instantes.': { en: 'Could not send the email. Please try again shortly.', es: 'No se pudo enviar el correo. Inténtalo de nuevo en unos instantes.' },
  'Escanear QR': { en: 'Scan QR', es: 'Escanear QR' },
  'Lanterna': { en: 'Flashlight', es: 'Linterna' },
  'Precisamos da câmera': { en: 'We need the camera', es: 'Necesitamos la cámara' },
  'Permita o acesso à câmera nas configurações do navegador ou do celular e abra esta tela de novo.': { en: 'Allow camera access in your browser or phone settings and open this screen again.', es: 'Permite el acceso a la cámara en los ajustes del navegador o del celular y abre esta pantalla de nuevo.' },
  'Aponte a câmera para o QR Code do estabelecimento.': { en: 'Point the camera at the venue QR code.', es: 'Apunta la cámara al código QR del establecimiento.' },
  'Este QR não é do Bora.': { en: 'This QR is not from Bora.', es: 'Este QR no es de Bora.' },
  '{title} a {price}': { en: '{title} for {price}', es: '{title} a {price}' },
  '{title} {percent}% OFF': { en: '{title} {percent}% OFF', es: '{title} {percent}% OFF' },
  'das {from} às {to}': { en: 'from {from} to {to}', es: 'de {from} a {to}' },
  'Esta promoção vale no dia do evento, das {from} às {to}.': { en: 'This promotion is valid on the event day, from {from} to {to}.', es: 'Esta promoción vale el día del evento, de {from} a {to}.' },
  'Este brinde só pode ser resgatado das {from} às {to}.': { en: 'This gift can only be redeemed from {from} to {to}.', es: 'Este regalo solo se puede canjear de {from} a {to}.' },
  'Benefício já entregue às {time}.': { en: 'Benefit already delivered at {time}.', es: 'Beneficio ya entregado a las {time}.' },
  'Benefício esgotado': { en: 'Benefit sold out', es: 'Beneficio agotado' },
  'Não foi possível resgatar agora. Tente novamente em instantes.': { en: 'Could not redeem right now. Please try again shortly.', es: 'No se pudo canjear ahora. Inténtalo de nuevo en unos instantes.' },
  'Instalar o app': { en: 'Install the app', es: 'Instalar la app' },
  'Toque em Compartilhar → Adicionar à Tela de Início': { en: 'Tap Share → Add to Home Screen', es: 'Toca Compartir → Añadir a pantalla de inicio' },
  'Dica: abra pelo app instalado para resgatar mais rápido.': { en: 'Tip: open the installed app to redeem faster.', es: 'Consejo: abre la app instalada para canjear más rápido.' },
  'Seu tempo acabou.': { en: 'Your time is up.', es: 'Se acabó tu tiempo.' },
  'Se a promoção ainda estiver valendo, leia o QR de novo para gerar outro.': { en: 'If the promotion is still running, scan the QR again to get a new one.', es: 'Si la promoción sigue vigente, lee el QR de nuevo para generar otro.' },
  'Benefício a ser resgatado': { en: 'Benefit to be redeemed', es: 'Beneficio por canjear' },
  'Seu código Bora': { en: 'Your Bora code', es: 'Tu código Bora' },
  'Mostre esta tela no balcão': { en: 'Show this screen at the counter', es: 'Muestra esta pantalla en el mostrador' },
  'Válido até {time}': { en: 'Valid until {time}', es: 'Válido hasta {time}' },
  'Peça no balcão': { en: 'Ask at the counter', es: 'Pídelo en el mostrador' },
  'Você já resgatou este benefício.': { en: 'You already redeemed this benefit.', es: 'Ya canjeaste este beneficio.' },
  'Entregue às {time}': { en: 'Delivered at {time}', es: 'Entregado a las {time}' },
  'Esta promoção já encerrou.': { en: 'This promotion has ended.', es: 'Esta promoción ya terminó.' },
  'Encerrou às {time}': { en: 'Ended at {time}', es: 'Terminó a las {time}' },
  'Promoção não encontrada': { en: 'Promotion not found', es: 'Promoción no encontrada' },
  'Não foi possível carregar a promoção.': { en: 'Could not load the promotion.', es: 'No se pudo cargar la promoción.' },
  'Depois de entrar, leia o QR de novo para resgatar.': { en: 'After signing in, scan the QR again to redeem.', es: 'Después de entrar, lee el QR de nuevo para canjear.' },
  'Cadastre-se': { en: 'Sign up', es: 'Regístrate' },
  'Contas de estabelecimento não resgatam promoções.': { en: 'Venue accounts cannot redeem promotions.', es: 'Las cuentas de establecimiento no canjean promociones.' },
  'Confirme seu e-mail para resgatar': { en: 'Confirm your email to redeem', es: 'Confirma tu correo para canjear' },
  'Promoção válida em {date}, das {from} às {to}.': { en: 'Promotion valid on {date}, from {from} to {to}.', es: 'Promoción válida el {date}, de {from} a {to}.' },
  'Confirme seu e-mail para resgatar.': { en: 'Confirm your email to redeem.', es: 'Confirma tu correo para canjear.' },
  '{count} aguardando aprovação': { en: '{count} awaiting approval', es: '{count} esperando aprobación' },
  '1 cadastro comercial aguardando aprovação': { en: '1 business registration awaiting approval', es: '1 registro comercial esperando aprobación' },
  '{count} cadastros comerciais aguardando aprovação': { en: '{count} business registrations awaiting approval', es: '{count} registros comerciales esperando aprobación' },
  'Acessar conta': { en: 'Access account', es: 'Acceder a la cuenta' },
  'Acesso de suporte iniciado': { en: 'Support access started', es: 'Acceso de soporte iniciado' },
  'Acesso de suporte encerrado': { en: 'Support access ended', es: 'Acceso de soporte finalizado' },
  'Acesso de suporte: você está na conta de {name}': { en: 'Support access: you are in {name}\'s account', es: 'Acceso de soporte: estás en la cuenta de {name}' },
  'Voltar para minha conta': { en: 'Back to my account', es: 'Volver a mi cuenta' },
  'Saindo...': { en: 'Leaving...', es: 'Saliendo...' },
  'Você vai usar o aplicativo como esta pessoa, vendo e podendo alterar o que ela vê. O acesso fica registrado no histórico e dura até 2 horas. Para sair, use "Voltar para minha conta" no topo da tela.': { en: 'You will use the app as this person, seeing and being able to change what they see. The access is recorded in the history and lasts up to 2 hours. To leave, use "Back to my account" at the top of the screen.', es: 'Vas a usar la aplicación como esta persona, viendo y pudiendo cambiar lo que ella ve. El acceso queda registrado en el historial y dura hasta 2 horas. Para salir, usa "Volver a mi cuenta" en la parte superior de la pantalla.' },
  'Você já está na sua própria conta.': { en: 'You are already in your own account.', es: 'Ya estás en tu propia cuenta.' },
  'Reative a conta antes de acessá-la.': { en: 'Reactivate the account before accessing it.', es: 'Reactiva la cuenta antes de acceder a ella.' },
  'Volte para a sua conta antes de acessar outra.': { en: 'Go back to your own account before accessing another one.', es: 'Vuelve a tu cuenta antes de acceder a otra.' },
  'Esta ação não está disponível durante o acesso de suporte.': { en: 'This action is not available during support access.', es: 'Esta acción no está disponible durante el acceso de soporte.' },
};
