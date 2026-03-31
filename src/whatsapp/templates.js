'use strict';

function menuSemAgendamento() {
  return (
    `*Oficina do TETEU*\n\n` +
    `1) Agendar serviço\n` +
    `2) Falar com atendente\n` +
    `3) Encerrar`
  );
}

function menuComAgendamento() {
  return (
    `*Oficina do TETEU*\n\n` +
    `Você tem um agendamento ativo.\n\n` +
    `1) Ver dados\n` +
    `2) Reagendar\n` +
    `3) Cancelar\n` +
    `4) Voltar ao menu principal`
  );
}

function slotsHorario() {
  return (
    `Escolha o horário (número):\n\n` +
    `1) Segunda 08:00\n` +
    `2) Segunda 14:00\n` +
    `3) Terça 09:00\n` +
    `4) Quarta 10:00\n` +
    `5) Quinta 11:00`
  );
}

function confirmarAgendamento({ horarioLabel, descricao }) {
  return `Confirma o agendamento?\n\nServiço: ${descricao}\nHorário: ${horarioLabel}\n\n1) Sim\n2) Não`;
}

module.exports = { menuSemAgendamento, menuComAgendamento, slotsHorario, confirmarAgendamento };
