import 'package:flutter/material.dart';
import '../components/cropwise_app_bar.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({Key? key}) : super(key: key);

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final _nameController = TextEditingController(text: 'Farmer');
  final _emailController = TextEditingController(text: 'farmer email');
  final _phoneController = TextEditingController(text: 'number');
  final _locationController = TextEditingController(text: 'location');
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _weatherAlerts = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CropWiseAppBar(currentPage: 'Account'),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            // Desktop layout
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Sidebar
                Container(
                  width: 250,
                  height: double.infinity,
                  color: Colors.grey[100],
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const CircleAvatar(
                        radius: 50,
                        backgroundColor: Color(0xFF6ABF69),
                        child: Icon(
                          Icons.person,
                          size: 50,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'John Farmer',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'Premium Member',
                        style: TextStyle(
                          color: Color(0xFF6ABF69),
                        ),
                      ),
                      const SizedBox(height: 32),
                      _buildSidebarItem(
                        icon: Icons.person_outline,
                        title: 'Profile',
                        isActive: true,
                        onTap: () {},
                      ),
                      _buildSidebarItem(
                        icon: Icons.notifications_outlined,
                        title: 'Notifications',
                        onTap: () {},
                      ),
                      _buildSidebarItem(
                        icon: Icons.security_outlined,
                        title: 'Security',
                        onTap: () {},
                      ),
                      _buildSidebarItem(
                        icon: Icons.payment_outlined,
                        title: 'Subscription',
                        onTap: () {},
                      ),
                      _buildSidebarItem(
                        icon: Icons.help_outline,
                        title: 'Help & Support',
                        onTap: () {},
                      ),
                      const Spacer(),
                      _buildSidebarItem(
                        icon: Icons.logout,
                        title: 'Logout',
                        textColor: Colors.red,
                        onTap: () {
                          _showLogoutConfirmation(context);
                        },
                      ),
                    ],
                  ),
                ),
                // Main content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Account Settings',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 32),
                        _buildProfileSection(),
                        const SizedBox(height: 32),
                        _buildNotificationSection(),
                        const SizedBox(height: 32),
                        _buildFarmDetailsSection(),
                      ],
                    ),
                  ),
                ),
              ],
            );
          } else {
            // Mobile layout
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile header
                  Center(
                    child: Column(
                      children: [
                        const CircleAvatar(
                          radius: 50,
                          backgroundColor: Color(0xFF6ABF69),
                          child: Icon(
                            Icons.person,
                            size: 50,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'John Farmer',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Text(
                          'Premium Member',
                          style: TextStyle(
                            color: Color(0xFF6ABF69),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Account Settings',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildProfileSection(),
                  const SizedBox(height: 24),
                  _buildNotificationSection(),
                  const SizedBox(height: 24),
                  _buildFarmDetailsSection(),
                  const SizedBox(height: 32),
                  Center(
                    child: ElevatedButton(
                      onPressed: () {
                        _showLogoutConfirmation(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red[400],
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                      ),
                      child: const Text('Logout'),
                    ),
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }

  void _showLogoutConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout Confirmation'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.pushReplacementNamed(context, '/login');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[400],
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSidebarItem({
    required IconData icon,
    required String title,
    bool isActive = false,
    Color? textColor,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF6ABF69).withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isActive ? const Color(0xFF6ABF69) : textColor ?? Colors.black54,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isActive ? const Color(0xFF6ABF69) : textColor ?? Colors.black,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        onTap: onTap,
        dense: true,
      ),
    );
  }

  Widget _buildProfileSection() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email_outlined),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: Icon(Icons.phone_outlined),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                prefixIcon: Icon(Icons.location_on_outlined),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Save profile changes
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Profile updated successfully'),
                    backgroundColor: Color(0xFF6ABF69),
                  ),
                );
              },
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationSection() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Notification Settings',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Email Notifications'),
              subtitle: const Text('Receive updates and alerts via email'),
              value: _emailNotifications,
              onChanged: (value) {
                setState(() {
                  _emailNotifications = value;
                });
              },
              activeColor: const Color(0xFF6ABF69),
            ),
            const Divider(),
            SwitchListTile(
              title: const Text('SMS Notifications'),
              subtitle: const Text('Receive urgent alerts via SMS'),
              value: _smsNotifications,
              onChanged: (value) {
                setState(() {
                  _smsNotifications = value;
                });
              },
              activeColor: const Color(0xFF6ABF69),
            ),
            const Divider(),
            SwitchListTile(
              title: const Text('Weather Alerts'),
              subtitle: const Text('Get notified about severe weather conditions'),
              value: _weatherAlerts,
              onChanged: (value) {
                setState(() {
                  _weatherAlerts = value;
                });
              },
              activeColor: const Color(0xFF6ABF69),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Save notification settings
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Notification settings updated'),
                    backgroundColor: Color(0xFF6ABF69),
                  ),
                );
              },
              child: const Text('Save Preferences'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFarmDetailsSection() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Farm Details',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Manage your farm details and preferences',
              style: TextStyle(
                color: Colors.black54,
              ),
            ),
            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.location_on, color: Color(0xFF6ABF69)),
              title: const Text('Farm Location'),
              subtitle: const Text('Bendigo, Victoria'),
              trailing: const Icon(Icons.edit),
              onTap: () {
                Navigator.pushNamed(context, '/my_farm');
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.grass, color: Color(0xFF6ABF69)),
              title: const Text('Soil Type'),
              subtitle: const Text('Loam'),
              trailing: const Icon(Icons.edit),
              onTap: () {
                Navigator.pushNamed(context, '/my_farm');
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.history, color: Color(0xFF6ABF69)),
              title: const Text('Crop History'),
              subtitle: const Text('Wheat, Barley, Canola'),
              trailing: const Icon(Icons.edit),
              onTap: () {
                Navigator.pushNamed(context, '/my_farm');
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/my_farm');
              },
              child: const Text('Edit Farm Details'),
            ),
          ],
        ),
      ),
    );
  }
}