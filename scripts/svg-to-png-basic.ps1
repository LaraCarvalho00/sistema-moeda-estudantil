param(
  [string]$InputDir = "docs/uml"
)

Add-Type -AssemblyName System.Drawing

$culture = [System.Globalization.CultureInfo]::InvariantCulture

function Get-Attr($node, [string]$name, $default = $null) {
  if ($node.Attributes -and $node.Attributes[$name]) {
    return $node.Attributes[$name].Value
  }
  return $default
}

function To-Num($value, [double]$default = 0) {
  if ($null -eq $value -or $value -eq "") { return $default }
  $clean = "$value" -replace "px", ""
  if ($clean -match "%$") { return $default }
  [double]$parsed = $default
  if ([double]::TryParse($clean, [System.Globalization.NumberStyles]::Float, $culture, [ref]$parsed)) {
    return $parsed
  }
  return $default
}

function To-Color($value, [int]$alpha = 255) {
  if ($null -eq $value -or $value -eq "" -or $value -eq "none") {
    return [System.Drawing.Color]::Transparent
  }
  $v = "$value"
  if ($v.StartsWith("#")) {
    $hex = $v.Substring(1)
    if ($hex.Length -eq 3) {
      $hex = -join ($hex.ToCharArray() | ForEach-Object { "$_$_" })
    }
    $r = [Convert]::ToInt32($hex.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($hex.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($hex.Substring(4, 2), 16)
    return [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
  }
  return [System.Drawing.Color]::FromName($v)
}

function New-PenFromNode($node) {
  $stroke = Get-Attr $node "stroke" "#000000"
  $sw = To-Num (Get-Attr $node "stroke-width" "1") 1
  $pen = New-Object System.Drawing.Pen (To-Color $stroke), $sw
  if (Get-Attr $node "stroke-dasharray" $null) {
    $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
  }
  return $pen
}

function Add-RoundRect($path, [double]$x, [double]$y, [double]$w, [double]$h, [double]$r) {
  if ($r -le 0) {
    $path.AddRectangle([System.Drawing.RectangleF]::new($x, $y, $w, $h))
    return
  }
  $d = [Math]::Min($r * 2, [Math]::Min($w, $h))
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
}

function Draw-Arrow($g, [double]$x1, [double]$y1, [double]$x2, [double]$y2, $color) {
  $angle = [Math]::Atan2($y2 - $y1, $x2 - $x1)
  $len = 14
  $spread = 0.45
  $p1 = [System.Drawing.PointF]::new(
    $x2 - $len * [Math]::Cos($angle - $spread),
    $y2 - $len * [Math]::Sin($angle - $spread)
  )
  $p2 = [System.Drawing.PointF]::new($x2, $y2)
  $p3 = [System.Drawing.PointF]::new(
    $x2 - $len * [Math]::Cos($angle + $spread),
    $y2 - $len * [Math]::Sin($angle + $spread)
  )
  $brush = New-Object System.Drawing.SolidBrush $color
  $g.FillPolygon($brush, @($p1, $p2, $p3))
  $brush.Dispose()
}

function Draw-TextNode($g, $node) {
  $xDefault = To-Num (Get-Attr $node "x" "0")
  $y = To-Num (Get-Attr $node "y" "0")
  $size = To-Num (Get-Attr $node "font-size" "16") 16
  $weight = To-Num (Get-Attr $node "font-weight" "400") 400
  $anchor = Get-Attr $node "text-anchor" "start"
  $fill = To-Color (Get-Attr $node "fill" "#0f172a")
  $style = if ($weight -ge 700) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  $font = New-Object System.Drawing.Font "Arial", $size, $style, ([System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush $fill

  $currentY = $y
  $spans = @($node.ChildNodes | Where-Object { $_.Name -eq "tspan" })
  if ($spans.Count -eq 0) {
    $spans = @($node)
  }

  foreach ($span in $spans) {
    $line = if ($span.Name -eq "tspan") { $span.InnerText } else { $node.InnerText }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $x = To-Num (Get-Attr $span "x" $xDefault) $xDefault
    if ($span.Name -eq "tspan") {
      $currentY += To-Num (Get-Attr $span "dy" "0") 0
    }
    $measured = $g.MeasureString($line, $font)
    $drawX = $x
    if ($anchor -eq "middle") { $drawX = $x - ($measured.Width / 2) }
    if ($anchor -eq "end") { $drawX = $x - $measured.Width }
    $drawY = $currentY - ($size * 0.86)
    $g.DrawString($line, $font, $brush, [single]$drawX, [single]$drawY)
  }

  $brush.Dispose()
  $font.Dispose()
}

function Draw-Node($g, $node) {
  if ($node.NodeType -ne [System.Xml.XmlNodeType]::Element) { return }
  if ($node.Name -eq "defs" -or $node.Name -eq "marker" -or $node.Name -eq "path") { return }

  switch ($node.Name) {
    "rect" {
      $x = To-Num (Get-Attr $node "x" "0")
      $y = To-Num (Get-Attr $node "y" "0")
      $w = To-Num (Get-Attr $node "width" "0")
      $h = To-Num (Get-Attr $node "height" "0")
      $rx = To-Num (Get-Attr $node "rx" "0")
      $opacity = To-Num (Get-Attr $node "opacity" "1") 1
      $alpha = [int]([Math]::Max(0, [Math]::Min(255, $opacity * 255)))
      $fill = To-Color (Get-Attr $node "fill" "none") $alpha
      $stroke = Get-Attr $node "stroke" $null
      $path = New-Object System.Drawing.Drawing2D.GraphicsPath
      Add-RoundRect $path $x $y $w $h $rx
      if ($fill.A -gt 0) {
        $brush = New-Object System.Drawing.SolidBrush $fill
        $g.FillPath($brush, $path)
        $brush.Dispose()
      }
      if ($stroke) {
        $pen = New-PenFromNode $node
        $g.DrawPath($pen, $path)
        $pen.Dispose()
      }
      $path.Dispose()
    }
    "ellipse" {
      $cx = To-Num (Get-Attr $node "cx" "0")
      $cy = To-Num (Get-Attr $node "cy" "0")
      $rx = To-Num (Get-Attr $node "rx" "0")
      $ry = To-Num (Get-Attr $node "ry" "0")
      $fill = To-Color (Get-Attr $node "fill" "none")
      if ($fill.A -gt 0) {
        $brush = New-Object System.Drawing.SolidBrush $fill
        $g.FillEllipse($brush, $cx - $rx, $cy - $ry, $rx * 2, $ry * 2)
        $brush.Dispose()
      }
      $pen = New-PenFromNode $node
      $g.DrawEllipse($pen, $cx - $rx, $cy - $ry, $rx * 2, $ry * 2)
      $pen.Dispose()
    }
    "circle" {
      $cx = To-Num (Get-Attr $node "cx" "0")
      $cy = To-Num (Get-Attr $node "cy" "0")
      $r = To-Num (Get-Attr $node "r" "0")
      $fill = To-Color (Get-Attr $node "fill" "none")
      if ($fill.A -gt 0) {
        $brush = New-Object System.Drawing.SolidBrush $fill
        $g.FillEllipse($brush, $cx - $r, $cy - $r, $r * 2, $r * 2)
        $brush.Dispose()
      }
      $pen = New-PenFromNode $node
      $g.DrawEllipse($pen, $cx - $r, $cy - $r, $r * 2, $r * 2)
      $pen.Dispose()
    }
    "line" {
      $x1 = To-Num (Get-Attr $node "x1" "0")
      $y1 = To-Num (Get-Attr $node "y1" "0")
      $x2 = To-Num (Get-Attr $node "x2" "0")
      $y2 = To-Num (Get-Attr $node "y2" "0")
      $pen = New-PenFromNode $node
      $g.DrawLine($pen, $x1, $y1, $x2, $y2)
      if (Get-Attr $node "marker-end" $null) {
        Draw-Arrow $g $x1 $y1 $x2 $y2 $pen.Color
      }
      $pen.Dispose()
    }
    "polyline" {
      $raw = Get-Attr $node "points" ""
      $pts = @()
      foreach ($pair in ($raw -split "\\s+")) {
        if ($pair -notmatch ",") { continue }
        $xy = $pair -split ","
        $pts += [System.Drawing.PointF]::new((To-Num $xy[0]), (To-Num $xy[1]))
      }
      if ($pts.Count -gt 1) {
        $pen = New-PenFromNode $node
        $g.DrawLines($pen, $pts)
        if (Get-Attr $node "marker-end" $null) {
          $a = $pts[$pts.Count - 2]
          $b = $pts[$pts.Count - 1]
          Draw-Arrow $g $a.X $a.Y $b.X $b.Y $pen.Color
        }
        $pen.Dispose()
      }
    }
    "text" {
      Draw-TextNode $g $node
    }
  }

  foreach ($child in $node.ChildNodes) {
    Draw-Node $g $child
  }
}

Get-ChildItem -Path $InputDir -Filter "*.svg" | ForEach-Object {
  [xml]$doc = Get-Content -Raw -LiteralPath $_.FullName
  $svg = $doc.DocumentElement
  $width = [int](To-Num (Get-Attr $svg "width" "1200") 1200)
  $height = [int](To-Num (Get-Attr $svg "height" "800") 800)
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear([System.Drawing.Color]::White)

  foreach ($child in $svg.ChildNodes) {
    Draw-Node $g $child
  }

  $png = [System.IO.Path]::ChangeExtension($_.FullName, ".png")
  $bitmap.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bitmap.Dispose()
  Write-Output "Gerado: $png"
}
