export const defaultNotifyMessages: any = {
  en: {
    transaction: {
      txRequest: 'Your transaction is waiting for you to confirm',
      nsfFail: 'You have insufficient funds to complete this transaction',
      txUnderpriced:
        'The gas price for your transaction is too low, try again with a higher gas price',
      txRepeat: 'This could be a repeat transaction',
      txAwaitingApproval:
        'You have a previous transaction waiting for you to confirm',
      txConfirmReminder:
        'Please confirm your transaction to continue, the transaction window may be behind your browser',
      txSendFail: 'You rejected the transaction',
      txSent: 'Your transaction has been sent to the network',
      txStallPending:
        'Your transaction has stalled and has not entered the transaction pool',
      txStuck: 'Your transaction is stuck due to a nonce gap',
      txPool: 'Your transaction has started',
      txStallConfirmed:
        "Your transaction has stalled and hasn't been confirmed",
      txSpeedUp: 'Your transaction has been sped up',
      txCancel: 'Your transaction is being canceled',
      txFailed: 'Your transaction has failed',
      txConfirmed: 'Your transaction has succeeded',
      txError: 'Oops something went wrong, please try again'
    },
    watched: {
      txPool:
        'Your account is {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
      txSpeedUp:
        'Transaction for {formattedValue} {asset} {preposition} {counterpartyShortened} has been sped up',
      txCancel:
        'Transaction for {formattedValue} {asset} {preposition} {counterpartyShortened} has been canceled',
      txConfirmed:
        'Your account successfully {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}',
      txFailed:
        'Your account failed to {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}'
    },
    time: {
      minutes: 'min',
      seconds: 'sec'
    }
  },
  es: {
    transaction: {
      txRequest: 'Su transacciÃ³n estÃ¡ esperando que confirme',
      nsfFail: 'No tiene fondos suficientes para completar esta transacciÃ³n.',
      txUnderpriced:
        'El precio del gas para su transacciÃ³n es demasiado bajo, intente nuevamente con un precio del gas mÃ¡s alto',
      txRepeat: 'Esto podrÃ­a ser una transacciÃ³n repetida',
      txAwaitingApproval:
        'Tienes una transacciÃ³n anterior esperando que confirmes',
      txConfirmReminder:
        'Confirme su transacciÃ³n para continuar, la ventana de transacciÃ³n puede estar detrÃ¡s de su navegador',
      txSendFail: 'Rechazaste la transacciÃ³n',
      txSent: 'Su transacciÃ³n ha sido enviada a la red.',
      txStallPending:
        'Su transacciÃ³n se ha estancado y no ha ingresado al grupo de transacciones',
      txStuck: 'Su transacciÃ³n estÃ¡ atascada debido a una brecha de nonce',
      txPool: 'Su transacciÃ³n ha comenzado',
      txStallConfirmed:
        'Su transacciÃ³n se ha estancado y no ha sido confirmada.',
      txSpeedUp: 'Su transacciÃ³n ha sido acelerada',
      txCancel: 'Tu transacciÃ³n estÃ¡ siendo cancelada',
      txFailed: 'Su transacciÃ³n ha fallado',
      txConfirmed: 'Su transacciÃ³n ha tenido Ã©xito.',
      txError: 'Vaya, algo saliÃ³ mal, por favor intente nuevamente'
    },
    watched: {
      txPool:
        'su cuenta estÃ¡ {verb, select, receiving {recibiendo} sending {enviando}} {formattedValue} {asset} {preposition, select, from {desde} to {a}} {counterpartyShortened}',
      txSpeedUp:
        'su cuenta estÃ¡ {verb, select, receiving {recibiendo} sending {enviando}} {formattedValue} {asset} {preposition, select, from {desde} to {a}} {counterpartyShortened}',
      txCancel:
        'su cuenta estÃ¡ {verb, select, receiving {recibiendo} sending {enviando}} {formattedValue} {asset} {preposition, select, from {desde} to {a}} {counterpartyShortened}',
      txConfirmed:
        'su cuenta {verb, select, received {recibiÃ³} sent {ha enviado}} con Ã©xito {formattedValue} {asset} {preposition, select, from {de} to {a}} {counterpartyShortened}',
      txFailed:
        'su cuenta fallado {verb, select, received {recibiÃ³} sent {ha enviado}} con Ã©xito {formattedValue} {asset} {preposition, select, from {de} to {a}} {counterpartyShortened}'
    },
    time: {
      minutes: 'min',
      seconds: 'sec'
    }
  }
}
