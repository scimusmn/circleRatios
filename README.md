## Installation instructions (OSX 10.9):


The application itself is a webapp, written in HTML5 and Javascript, which uses a webcam to track a light moving across the field of view. In order for this app to start up and run properly, a local SSL webserver must be set up and running. To do this, a self-signed SSL key needs to be created, and the native Apache server needs to be configured to allow SSL connections. The Apache server then needs to be set to start on login. An explanation of these steps follows.



#### Preliminary setup


1. Set the name of the computer: 


The SMM computer name is set to CircleRatios, but you can name it whatever is necessary. Note the name for use in later steps. Use the following command:


sudo scutil --set HostName CircleRatios


2. Create a “Sites” folder in the root directory for the default user:


mkdir ~/Sites


3. Move all of the webapp files into “~/Sites/” in a “circleRatios” folder.



#### Create the SSL certificate


1. Create a directory in your Apache distro to hold SSL keys and certificates:

mkdir /private/etc/apache2/ssl && cd $_


2. Create an ssh key:
sudo ssh-keygen -f server.key (when prompted for a password, leave it blank)


3. Create a certificate request file:


        This step create a file used in the certificate generation process. It includes information about you and your website. It asks for country, state, city, organization, division, and the name of the server. The most important of these is the common name (name of the server), which should be set to the computer name, followed by “.local”. This makes it so chrome can trust the certificate without need for prompting. Use the following command, and follow on screen instructions:


sudo openssl req -new -key server.key -out request.csr


4. Generate the self-signed certificate


        Using the request file and key from above generate a certificate file to be used by apache to make the SSL connections. The certificate generated should be good for 100 years (36500 days) from the generation date.


sudo openssl x509 -req -days 36500 -in request.csr -signkey server.key -out server.crt



#### Configure Apache
1. Make copies of httpd.conf, httpd-ssl.conf, httpd-vhosts.conf:


        We’re going to be making changes to these files, so it’s best to be able to go back if you need to.


cd /private/etc/apache2/
sudo cp httpd.conf ./httpd-backup.conf
sudo cp extra/httpd-ssl.conf extra/httpd-ssl-backup.conf
sudo cp extra/httpd-vhosts.conf extra/httpd-vhosts-backup.conf


2. Edit the “httpd.conf” file:


        In this file, we have to enable SSL, the vhosts config file, and the document directories that we will be using.


        First, uncomment the following lines in the “httpd.conf” file by removing the “#” at the beginning of the line:


Include /private/etc/apache2/extra/httpd-ssl.conf
Include /private/etc/apache2/extra/httpd-vhosts.conf


Next, add the following code to “httpd.conf”, replacing $UserWebDir with the file system path to the sites directory that was created in step 2 of the “Preliminary Setup” section (eg, “/Users/exhibits/Sites”). This should be placed under the other <Directory> code in the file.


        <Directory "$UserWebDir">
  Options Indexes FollowSymLinks MultiViews
  AllowOverride None
  Order allow,deny
  Allow from all
</Directory>


Save and close the file.


3. Edit the “extra/httpd-ssl.conf” file:


        Change the lines starting with SSLCertificateFile and SSLCertificateKeyFile to:


        SSLCertificateFile "/private/etc/apache2/ssl/server.crt"
        SSLCertificateKeyFile "/private/etc/apache2/ssl/server.key"
        Also, if the following lines are not already commented, comment them out:


        #SSLCACertificatePath "/private/etc/apache2/ssl.crt"
#SSLCARevocationPath "/private/etc/apache2/ssl.crl"


        Finally, change the “DocumentRoot” to the file path of the folder created in step 2 of “Preliminary Steps” (eg, “/Users/exhibits/Sites/”), and change “ServerName” to the computer name followed by “.local:443” (eg, “CircleRatios.local:443”)


4. Edit the “extra/httpd-vhosts.conf” file:


        Under the line “NameVirtualHost *:80”, add the line:


        NameVirtualHost *:443


        Also in this file, add the following lines, where “$UserWebDir” is the folder created in step 2 of the “Preliminary Steps” section:


        <VirtualHost *:443>
    SSLEngine on
    SSLCipherSuite ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP:+eNULL
    SSLCertificateFile /private/etc/apache2/ssl/server.crt
    SSLCertificateKeyFile /private/etc/apache2/ssl/server.key
    ServerName localhost
    DocumentRoot "$UserWebDir"
</VirtualHost>


5. Check Apache configuration, and restart apache:


        sudo apachectl configtest
        sudo apachectl restart


6. Enable Apache startup at login:
        
        sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist


        To disable this startup, simply run:


        sudo launchctl unload -w /System/Library/LaunchDaemons/org.apache.httpd.plist

#### Additional Startup configuration tricks


        It may be that I am failing to configured OSX 10.9 correctly, but there are a few additional tricks that I needed to do before the system would start up withouth any hiccups. These are listed below.



#### Launching Chrome into Kiosk mode cleanly:


1. Duplicate the Chrome user data directory:


        cp -r ~/Library/Application\ Support/Google/Chrome/Default ~/Documents/chromeData


2. Start Chrome through the command line using the copied data directory, and confirm all dialogs


open /Applications/Google\ Chrome.app --args --user-data-dir="/Users/exhibits/Documents/chromeData" "https://CircleRatios.local/circleRatios/"


3. Quit Chrome


4. Add the “startup.command” file to the login items


        In “System Preferences”, select “Accounts” and click the “Login Items” tab. Click the “+” button, and navigate to the location of the “startup.command” file. This file contains the following commands:


        rm -r ~/Documents/chromeTemp
cp -r ~/Documents/chromeData ~/Documents/chromeTemp


        open /Applications/Google\ Chrome.app --args --kiosk --user-data-dir="/Users/exhibits/Documents/chromeData" "https://CircleRatios.local/circleRatios/"


        These commands remove the Chrome data file from the previous session, copy and new version of the data to be used for this session, and start Chrome referencing that new data. This retains all of the dialogs confirmed in step 2, but prevents the “Chrome was shut down improperly” warnings.


5. Disable OSX Resume: 


        The biggest trouble with starting Chrome in OSX 10.9 is that if Resume is enabled, OSX will start a copy of Chrome before the “startup.command” has a chance to open it in Kiosk mode, and thus makes it start improperly. To turn off OSX resume, run the following in Terminal:


        defaults write -g ApplePersistence -bool no
