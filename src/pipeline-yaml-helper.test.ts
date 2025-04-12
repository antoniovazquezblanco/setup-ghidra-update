//import * as pipeline_yaml_helper from "./pipeline-yaml-helper.js";

const sample_yaml_1 =
  "name: Build\r\n" +
  "on: [push, pull_request, workflow_dispatch]\r\n" +
  "permissions:\r\n" +
  "  contents: write\r\n" +
  "\r\n" +
  "jobs:\r\n" +
  "  build:\r\n" +
  "    runs-on: ubuntu-latest\r\n" +
  "\r\n" +
  "    strategy:\r\n" +
  "      matrix:\r\n" +
  "        ghidra:\r\n" +
  '          - "11.3"\r\n' +
  '          - "11.2.1"\r\n' +
  '          - "11.2"\r\n' +
  '          - "11.1.2"\r\n' +
  '          - "11.1.1"\r\n' +
  '          - "11.1"\r\n' +
  '          - "11.0.3"\r\n' +
  '          - "11.0.2"\r\n' +
  '          - "11.0.1"\r\n' +
  '          - "11.0"\r\n' +
  '          - "10.4"\r\n' +
  "\r\n" +
  "    steps:\r\n" +
  "    - name: Clone Repository\r\n" +
  "      uses: actions/checkout@v4\r\n" +
  "  \r\n" +
  "    - name: Install Java\r\n" +
  "      uses: actions/setup-java@v4\r\n" +
  "      with:\r\n" +
  "        distribution: 'temurin'\r\n" +
  "        java-version: '21'\r\n" +
  "\r\n" +
  "    - name: Install Gradle\r\n" +
  "      uses: gradle/actions/setup-gradle@v4\r\n" +
  "\r\n" +
  "    - name: Install Ghidra ${{ matrix.ghidra }}\r\n" +
  "      uses: antoniovazquezblanco/setup-ghidra@v2.0.9\r\n" +
  "      with:\r\n" +
  "        auth_token: ${{ secrets.GITHUB_TOKEN }}\r\n" +
  "        version: ${{ matrix.ghidra }}\r\n" +
  "\r\n" +
  "    - name: Build\r\n" +
  "      run: gradle buildExtension\r\n" +
  "\r\n" +
  "    - name: Upload artifacts\r\n" +
  "      uses: actions/upload-artifact@v4\r\n" +
  "      with:\r\n" +
  "        name: DeviceTreeBlob_Ghidra_${{ matrix.ghidra }}\r\n" +
  "        path: dist/*.zip\r\n" +
  "\r\n" +
  "  release:\r\n" +
  '    runs-on: "ubuntu-latest"\r\n' +
  "    needs: build\r\n" +
  "\r\n" +
  "    steps:\r\n" +
  "    - name: Get current date\r\n" +
  "      id: date\r\n" +
  `      run: echo "::set-output name=date::$(date +'%Y-%m-%d')"\r\n` +
  "\r\n" +
  "    - name: Download binaries\r\n" +
  "      uses: actions/download-artifact@v4\r\n" +
  "\r\n" +
  "    - name: Release nightly\r\n" +
  "      if: github.ref == 'refs/heads/main'\r\n" +
  "      uses: marvinpinto/action-automatic-releases@v1.2.1\r\n" +
  "      with:\r\n" +
  '        repo_token: "${{ secrets.GITHUB_TOKEN }}"\r\n' +
  '        automatic_release_tag: "latest"\r\n' +
  "        prerelease: true\r\n" +
  '        title: "Ghidra DeviceTreeBlob Nightly (${{steps.date.outputs.date}})"\r\n' +
  "        files: DeviceTreeBlob_Ghidra_*/*.zip\r\n" +
  "\r\n" +
  "    - name: Release stable\r\n" +
  "      if: contains(github.ref, 'refs/tags/v')\r\n" +
  "      uses: marvinpinto/action-automatic-releases@v1.2.1\r\n" +
  "      with:\r\n" +
  '        repo_token: "${{ secrets.GITHUB_TOKEN }}"\r\n' +
  "        prerelease: false\r\n" +
  '        title: "Ghidra DeviceTreeBlob ${{github.ref_name}}"\r\n' +
  "        files: DeviceTreeBlob_Ghidra_*/*.zip\r\n";

test("", () => {});
