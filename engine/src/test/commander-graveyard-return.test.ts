/**
 * Jocasta, Automaton Avenger: "whenever your commander deals combat damage to
 * a player, put a +1/+1 counter on Jocasta" and "whenever you attack with
 * your commander, if this card is in your graveyard, you may return it to the
 * battlefield tapped and attacking" — no engine code: Archivist of Gondor's
 * commander filter, W'Kabi's attack trigger, and Warcry Phoenix's graveyard
 * return with Blood Operative's intervening if (rule 603.4). Entering
 * attacking, it attacks what its controller chooses (rule 508.4).
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, counters, life, pickModes, spawn, table, toGraveyard, zone } from "./harness.js";

const JOCASTA = "Jocasta, Automaton Avenger";

describe("Jocasta, Automaton Avenger", () => {
  it("returns from the graveyard tapped and attacking when you attack with your commander", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const jocasta = toGraveyard(game, JOCASTA);
    pickModes(a, 0);
    attack(game, a, [commander]);
    expect(zone(game, jocasta)).toBe("battlefield");
    expect(game.state.objects[jocasta].tapped).toBe(true);
    // Hill Giant's 3 and Jocasta's 2: it was attacking bob.
    expect(life(game, B)).toBe(20 - 3 - 2);
    // Back in time to see the commander's combat damage.
    expect(counters(game, jocasta)).toBe(1);
  });

  it("stays in the graveyard if you decline, or attack without your commander", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const jocasta = toGraveyard(game, JOCASTA);
    pickModes(a);
    attack(game, a, [commander]);
    expect(zone(game, jocasta)).toBe("graveyard");
    expect(life(game, B)).toBe(17);

    const { game: g2, a: a2 } = table();
    const bears = spawn(g2, "Grizzly Bears");
    const j2 = toGraveyard(g2, JOCASTA);
    pickModes(a2, 0);
    attack(g2, a2, [bears]);
    expect(zone(g2, j2)).toBe("graveyard");
    expect(life(g2, B)).toBe(18);
  });

  it("only your commander's combat damage to a player puts a counter on Jocasta", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const bears = spawn(game, "Grizzly Bears");
    const jocasta = spawn(game, JOCASTA);
    attack(game, a, [commander, bears]);
    expect(life(game, B)).toBe(20 - 3 - 2);
    expect(counters(game, jocasta)).toBe(1);

    const { game: g2, a: a2 } = table();
    const bears2 = spawn(g2, "Grizzly Bears");
    const j2 = spawn(g2, JOCASTA);
    attack(g2, a2, [bears2]);
    expect(counters(g2, j2)).toBe(0);
  });

  it("does nothing from the battlefield when you attack with your commander", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const jocasta = spawn(game, JOCASTA);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    attack(game, a, [commander]);
    expect(asked).toBe(0);
    expect(zone(game, jocasta)).toBe("battlefield");
    expect(game.state.objects[jocasta].tapped).toBe(false);
    expect(life(game, A)).toBe(20);
  });
});
