package com.moedaestudantil.infrastructure.notification;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.moedaestudantil.domain.model.TransacaoResumo;
import com.moedaestudantil.domain.model.Usuario;
import com.moedaestudantil.domain.model.Vantagem;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class CupomQrCodeServico {

  public CupomQrCode gerar(Usuario aluno, Vantagem vantagem, String cupom, TransacaoResumo transacao) {
    String payload =
        "PUC-COIN|cupom="
            + valor(cupom)
            + "|transacao="
            + valor(transacao.getId())
            + "|aluno="
            + valor(aluno.getId())
            + "|vantagem="
            + valor(vantagem.getId());
    return new CupomQrCode(payload, gerarSvgDataUri(payload));
  }

  private String gerarSvgDataUri(String payload) {
    try {
      Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
      hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
      hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
      hints.put(EncodeHintType.MARGIN, 2);
      BitMatrix matrix = new MultiFormatWriter().encode(payload, BarcodeFormat.QR_CODE, 240, 240, hints);
      String svg = paraSvg(matrix);
      return "data:image/svg+xml;base64,"
          + Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
    } catch (WriterException ex) {
      throw new IllegalStateException("Nao foi possivel gerar QR Code do cupom.", ex);
    }
  }

  private static String paraSvg(BitMatrix matrix) {
    int width = matrix.getWidth();
    int height = matrix.getHeight();
    StringBuilder svg = new StringBuilder();
    svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ")
        .append(width)
        .append(' ')
        .append(height)
        .append("\" width=\"240\" height=\"240\">");
    svg.append("<rect width=\"100%\" height=\"100%\" fill=\"#fff\"/>");
    svg.append("<path fill=\"#000\" d=\"");
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        if (matrix.get(x, y)) {
          svg.append('M').append(x).append(' ').append(y).append("h1v1h-1z");
        }
      }
    }
    svg.append("\"/></svg>");
    return svg.toString();
  }

  private static String valor(Object valor) {
    return valor == null ? "" : String.valueOf(valor);
  }

  public record CupomQrCode(String payload, String svgDataUri) {}
}
