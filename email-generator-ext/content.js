function createAIButton() {

    const button = document.createElement('div');
    button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
    button.style.marginRight = '8px';
    button.style.borderRadius = '18px';
    button.style.backgroundColor = "#0b57d0"
    button.innerText = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;

}

function getEmailContent() {


    const content = document.querySelector('.a3s.aiL');

        if(content) {
            return content.innerText.trim();
        }
       
     return '';
}

function findComposeToolbar() {
    const toolbar = document.querySelector('.btC');

    if (toolbar) {
        console.log('Toolbar found:', toolbar);
        return toolbar;
    }

    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if(existingButton) existingButton.remove();

    const toolBar = findComposeToolbar();
    if(!toolBar) {
        return;
    }
    const button = createAIButton();
    button.classList.add('ai-reply-button');
    button.addEventListener('click', async() => {
        try{
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    emailContent: emailContent,
                    tone: "professional"
                })
            });
            if(!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if(composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }
            else {
                console.error('Compose box not found. Cannot insert AI reply.');
            }
        } catch (error) {
            console.error('Error generating AI reply:', error);
        }
        finally{
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });
    toolBar.insertBefore(button, toolBar.firstChild);

}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElement = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') 
            || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElement) {
            setTimeout(injectButton, 500);
        }
    }
})

observer.observe(document.body, { childList: true, subtree: true });
   