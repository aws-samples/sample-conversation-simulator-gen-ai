import React from 'react'
import { useTranslation } from 'react-i18next';
import {
    ModalContent,
    ModalActions,
    Icon,
    Modal,
    Button,
    Header,
    FormTextArea,
    FormSelect,
    FormRadio,
    FormInput,
    FormGroup,
    FormCheckbox,
    FormButton,
    Form,
} from 'semantic-ui-react'

function CustomPromptModal({setCustomPrompt}) {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false)
    const [userJobTitle, setUserJobTitle] = React.useState("AWS salesperson")
    const [AIJobTitle, setAIJobTitle] = React.useState("CEO")
    const [accountName, setAccountName] = React.useState("Nordstrom Inc")
    const [context, setContext] = React.useState("")

    const AIJobTitleOptions = [
        { key: 'e', text: t('context.ai.jobTitles.ceo'), value: 'CEO' },
        { key: 'd', text: t('context.ai.jobTitles.dataScientist'), value: 'Data Scientist' },
        { key: 's', text: t('context.ai.jobTitles.softwareEngineer'), value: 'Software Engineer' },
        { key: 't', text: t('context.ai.jobTitles.cto'), value: 'CTO' },
        { key: 'i', text: t('context.ai.jobTitles.cio'), value: 'CIO' },
        { key: 'sec', text: t('context.ai.jobTitles.ciso'), value: 'CISO' },
        { key: 'm', text: t('context.ai.jobTitles.cmo'), value: 'CMO' },
    ]

    const userJobTitleOptions = [
        { key: 'sale', text: t('context.user.jobTitles.salesperson'), value: 'AWS Sales Person' },
        { key: 'sol', text: t('context.user.jobTitles.solutionArchitect'), value: 'AWS Solution Architect' },
        { key: 'acc', text: t('context.user.jobTitles.accountManager'), value: 'AWS Account Manager' },
        { key: 'spec', text: t('context.user.jobTitles.solutionArchitectSpecialist'), value: 'AWS Solution Architect Specialist' },
    ]

    const onClose = () => {
        setCustomPrompt(accountName, AIJobTitle, userJobTitle, context)
        setOpen(false)
    }

    return (
        <Modal
            closeIcon
            open={open}
            centered={false}
            // style={{ top: '50% !important', transform: 'translateY(-50%) !important' }}
            size={'small'}
            trigger={<Button>{t('context.modal.actions.editContext')}</Button>}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
        >
            <Header icon='edit' content={t('context.modal.actions.editContext')} />
            <ModalContent>
                <p>
                    {t('context.modal.content.provideInformation')}
                </p>
                <Form>
                    <FormGroup widths='equal'>
                        <FormSelect
                            fluid
                            label={t('context.modal.form.yourJobTitle')}
                            onChange={(e, { value }) => setUserJobTitle(value)}
                            options={userJobTitleOptions}
                            placeholder={t('context.user.jobTitles.salesperson')}
                        />

                        <FormSelect
                            fluid
                            label={t('context.modal.form.aiJobTitle')}
                            onChange={(e, { value }) => setAIJobTitle(value)}
                            options={AIJobTitleOptions}
                            placeholder={t('context.ai.jobTitles.ceo')}
                            defaultValue={"CEO"}
                        /> 
                        <FormTextArea 
                        label={t('context.modal.form.companyName')} 
                        placeholder='Nordstrom Inc' 
                        onChange={(e, { value }) => setAccountName(value)} 
                        />
                    </FormGroup>
                    <FormTextArea 
                    label={t('context.modal.form.companyOverview')} 
                    placeholder={t('context.modal.form.companyOverviewPlaceholder')} 
                    onChange={(e, { value }) => setContext(value)} 
                    />
                </Form>
            </ModalContent>
            <ModalActions>
                <Button class="ui primary button" onClick={onClose} disabled={context === ""}>
                    <Icon name='checkmark' /> {t('context.modal.actions.setCustomPrompt')}
                </Button>
            </ModalActions>
        </Modal>
    )
}

export default CustomPromptModal
