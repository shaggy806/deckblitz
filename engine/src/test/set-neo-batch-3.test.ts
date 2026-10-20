/**
 * Kamigawa: Neon Dynasty's "whenever a Samurai or Warrior you control attacks alone" — the
 * `attacks-alone` trigger's `filter` — and the two older cards on it (Ironsoul Enforcer, Raiyuu).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("the attacks-alone filter", () => {
  it("triggers for a lone Samurai or Warrior, not for another creature alone or two attackers", () => {
    const { game, a } = table();
    spawn(game, "Eiganjo Exemplar");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);

    const { game: g2, a: a2 } = table();
    const exemplar = spawn(g2, "Eiganjo Exemplar");
    attack(g2, a2, [exemplar]);
    expect(life(g2, B)).toBe(17);

    const { game: g3, a: a3 } = table();
    const ex3 = spawn(g3, "Eiganjo Exemplar");
    const warrior = spawn(g3, "Grizzly Bears");
    attack(g3, a3, [ex3, warrior]);
    expect(life(g3, B)).toBe(16);
  });

  it("gives the lone attacker lifelink, and +1/+0 per Samurai or Warrior counted once each", () => {
    const { game, a } = table();
    const samurai = spawn(game, "Selfless Samurai");
    const captain = spawn(game, "Asari Captain");
    attack(game, a, [captain]);
    // Two Samurai: Asari Captain hits for 4 + 2 and gains lifelink from Selfless Samurai.
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(26);
    expect(pt(game, captain).power).toBe(6);
    expect(keywords(game, captain).has("lifelink")).toBe(true);
    void samurai;
  });
});

describe("Imperial Subduer", () => {
  it("taps target creature you don't control", () => {
    const { game, a } = table();
    const subduer = spawn(game, "Imperial Subduer");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [subduer]);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Akki Ronin", () => {
  it("may discard a card to draw one", () => {
    const { game, a } = table();
    const ronin = spawn(game, "Akki Ronin");
    toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [ronin]);
    expect(hand(game).length).toBe(before);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(1);
  });
});

describe("Ancestral Katana", () => {
  it("may pay {1} to attach to the lone attacker", () => {
    const { game, a } = table();
    const katana = spawn(game, "Ancestral Katana");
    const samurai = spawn(game, "Imperial Subduer");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    attack(game, a, [samurai]);
    expect(game.state.objects[katana].attachedTo).toBe(samurai);
    expect(life(game, B)).toBe(15);
  });
});

describe("Norika Yamazaki, the Poet and Heiko Yamazaki, the General", () => {
  it("let you cast the targeted enchantment or artifact card from your graveyard this turn", () => {
    const { game, a } = table();
    const norika = spawn(game, "Norika Yamazaki, the Poet");
    const pacifism = toGraveyard(game, "Pacifism");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    pickTargets(a, pacifism);
    attack(game, a, [norika]);
    game.dispatch({ type: "cast-spell", player: A, card: pacifism, targets: [ref(bears)], via: "graveyard-permission" });
    settle(game);
    expect(zone(game, pacifism)).toBe("battlefield");
  });
});

describe("Raiyuu, Storm's Edge", () => {
  it("untaps the lone attacker and adds one more combat, only after the first", () => {
    const { game, a } = table();
    const raiyuu = spawn(game, "Raiyuu, Storm's Edge");
    attack(game, a, [raiyuu]);
    // It attacks alone in both combats; the second makes no third.
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[raiyuu].tapped).toBe(false);
  });
});

describe("Ironsoul Enforcer", () => {
  it("returns an artifact card when it or a commander you control attacks alone, once for a commander Enforcer", () => {
    const { game, a } = table();
    const enforcer = spawn(game, "Ironsoul Enforcer");
    const relic = toGraveyard(game, "Sol Ring");
    pickTargets(a, relic);
    attack(game, a, [enforcer]);
    expect(zone(game, relic)).toBe("battlefield");

    const { game: g2, a: a2 } = table();
    const e2 = spawn(g2, "Ironsoul Enforcer");
    g2.state.objects[e2].isCommander = true;
    toGraveyard(g2, "Sol Ring");
    toGraveyard(g2, "Mind Stone");
    attack(g2, a2, [e2]);
    const onField = g2.state.zones.shared.battlefield.filter((id) =>
      ["Sol Ring", "Mind Stone"].includes(g2.state.objects[id].cardName),
    );
    expect(onField.length).toBe(1);
  });
});
