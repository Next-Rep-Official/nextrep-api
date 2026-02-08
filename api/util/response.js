// First created Week 2 by Zane Beidas
// --------

/**
 * Response class to standardize responses from the backend
 */
export class CustomResponse {
    constructor(status, message, data = null) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    get() {
        return {
            status: this.status,
            body: {
                message: this.message,
                ...(this.data != null && { data: this.data }),
            },
        };
    }
}