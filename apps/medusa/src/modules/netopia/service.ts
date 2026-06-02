import { AbstractPaymentProvider } from '@medusajs/framework/utils'
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/framework/types'

type Options = {
  signature: string
  posSignature?: string
  sandbox?: boolean
}

/**
 * Netopia (mobilPay) payment provider for Medusa. There is no official module,
 * so this is custom. It is registered only when NETOPIA_SIGNATURE is present
 * (graceful degradation: absent → not loaded → the method is simply absent at
 * checkout). The real Netopia start/IPN integration (redirect URL + webhook
 * confirmation) lands when a Netopia contract/sandbox exists; the structure and
 * Medusa lifecycle methods are in place.
 */
class NetopiaProviderService extends AbstractPaymentProvider<Options> {
  static identifier = 'netopia'
  protected options_: Options

  constructor(container: Record<string, unknown>, options: Options) {
    super(container, options)
    this.options_ = options
  }

  static validateOptions(options: Options) {
    if (!options.signature) {
      throw new Error('Netopia payment provider requires a `signature` option.')
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    // Real: POST to Netopia start endpoint → return a redirect URL the storefront
    // sends the customer to. Until credentials exist, return a pending session.
    const id = `netopia_${crypto.randomUUID()}`
    return { id, data: { id, amount: input.amount, currency_code: input.currency_code, status: 'pending' } }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    // Real: verify the Netopia IPN/redirect result. Pending until confirmed.
    return { status: 'pending', data: { ...input.data, status: 'pending' } }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: { ...input.data, status: 'captured' } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: { ...input.data, status: 'canceled' } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: { ...input.data, status: 'refunded' } }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = (input.data?.status as GetPaymentStatusOutput['status']) ?? 'pending'
    return { status, data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getWebhookActionAndData(_payload: ProviderWebhookPayload['payload']): Promise<WebhookActionResult> {
    // Real: parse the Netopia IPN, verify signature, map to authorized/captured.
    return { action: 'not_supported' }
  }
}

export default NetopiaProviderService
