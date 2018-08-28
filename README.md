# gitlab-github-bridge

Did you ever had the problem, that you want to use and enhance an open source project, maintained in GitHub, but also want to use it with your corporate infrastructure, which is only available in your intranet?

This GitHub app synchronizes your private GitLab repository in a corporate environment (proxies, firewalls, ...) with a public GitHub repository.
It enables you to use GitLab CI/CD running on your private ressources and report it to the public github.com repository.

## Prerequisites

- The gitlab-github-bridge app requires an outgoing HTTPS connection from your internal network to github.com. If you use an outgoing proxy, you may need to whitelist it.
- Based on pure outgoing HTTPS calls it does not require further firewall changes.
- https://smee.io is used to be able to get WebHook calls from GitHub
- The app is designed to be deployed on a internal OpenShift cluster which you need to have (or you need to deploy it otherwise).

## Installation and use

The github app is designed to run in an RedHat OpenShift environment as a container. The folder `openshift` contains all necessary configurations to deploy the app. To do this, you need an OpenShift project and access to it via the command line tool `oc`. 

To use it, log in to OpenShift via `oc login` and set the project you want to use (`oc project <projectname>`) first. Add them like this:

    oc create -f openshift/secrets.yml
    oc create -f openshift/pem-secret.yml
    oc create -f openshift/imagestream.yml
    oc create -f openshift/buildconfig.yml
    oc create -f openshift/deploymentconfig.yml
    oc create -f openshift/service.yml

In the next step, replace the values of the created secrets by the actual values, because the `yml` files only created stubs for that. This requires you to register a github app like described [here](https://developer.github.com/apps/building-github-apps/creating-a-github-app/) and allow the app to access your repository. In your OpenShift UI go to Ressources/Secrets and choose the github-app-pem secret. Press `Add to Application` and select the new deployment config `dc-gitlab-github-bridge`. Choose `Volume` and enter `/mnt/secrets` as the mount path, then save this information.

Then you should be able to build the image in your OpenShift cluster and start the deployment. The running pod should now listen to messages from your gitlab installation, which needs to know, where to send these messages to. Therefore go to your repository to Settings / Integrations and add a hook for job events to the route of your github app in OpenShift.

Now every pipeline job running in your private gitlab-ci will be reported in the public github repository.


## Open ends and further enhancements

- The OpenShift configuration currently is hard coded as a bunch of single `yaml` files with `assistify` as the project name. This should be replaced by an OpenShift template which contains variables to make this easier. It could also merge all the separate `yml` files, so that you only need one single `oc` command to make it possible to use it.
- Mirroring from github to gitlab is not yet implemented. This should be done via a github web hook which is received by the app, which pulls the changes and pushes them to github, thereby initiating the next CI build.
