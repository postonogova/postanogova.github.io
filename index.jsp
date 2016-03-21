<%--
  Created by IntelliJ IDEA.
  User: postonogova-an
  Date: 17.03.2016
  Time: 14:25
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <title>Sudoku</title>
    <meta charset="UTF-8">
    <script src="js/jquery-2.2.0.js"></script>
    <link href="style/style.css" rel="stylesheet" type="text/css"/>
  </head>
  <body>
  <table id="tField">
   <%-- <div class="even"></div>
    <div class="odd"></div>--%>
  </table>
  <button id="calculate">Рассчитать</button>
  <script src="js/sudoku.js"></script>
  <script>
    $(document).ready(Sudoku.createTable);
  </script>
  </body>
</html>
