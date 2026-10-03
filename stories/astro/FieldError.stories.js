import FieldError from '../../src/astro/FieldError.astro';

export default { title: 'Astro/FieldError', component: FieldError, tags: ['autodocs'], parameters: { layout: 'padded' } };

export const Single = { args: {"errors": [{"message": "Please enter an email."}, {"message": "Please enter an email."}]} };
export const Multiple = { args: {"errors": [{"message": "Enter an email."}, {"message": "Enter a name."}]} };
export const Empty = { args: {} };
