/**
 * Innistrad and Dark Ascension (ISD, DKA) — group D of batch 188.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sudden Disappearance", () => {
  it("exiles the target player's nonland permanents and returns the cards at the next end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 6);
    const spell = toHand(game, "Sudden Disappearance");
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
    toStep(game, "cleanup");
    settle(game);
    const back = named(game, "Grizzly Bears", B);
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
  });
});

describe("Tracker's Instincts", () => {
  it("must put the revealed creature card into hand and the rest into the graveyard", () => {
    const { game } = table();
    toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    const before = graveyard(game).length;
    const spell = toHand(game, "Tracker's Instincts");
    cast(game, spell);
    expect(zone(game, bears)).toBe("hand");
    // Three others milled, plus the sorcery itself.
    expect(graveyard(game).length - before).toBe(4);
  });
});

describe("Ravenous Demon // Archdemon of Greed", () => {
  it("transforms by sacrificing a Human, then punishes an upkeep with no Human", () => {
    const { game } = table();
    const demon = spawn(game, "Ravenous Demon");
    const human = spawn(game, "Disciple of Griselbrand");
    game.dispatch({ type: "activate-ability", player: A, source: demon, abilityIndex: 0, targets: [], sacrifice: human });
    settle(game);
    expect(zone(game, human)).toBe("graveyard");
    expect(pt(game, demon)).toEqual({ power: 9, toughness: 9 });
    const before = life(game);
    toStep(game, "upkeep");
    toStep(game, "precombat-main");
    expect(life(game)).toBe(before - 9);
    expect(game.state.objects[demon].tapped).toBe(true);
  });

  it("sacrifices a Human at upkeep and takes no damage", () => {
    const { game } = table();
    const demon = spawn(game, "Ravenous Demon");
    const human = spawn(game, "Disciple of Griselbrand");
    const human2 = spawn(game, "Loyal Cathar");
    game.dispatch({ type: "activate-ability", player: A, source: demon, abilityIndex: 0, targets: [], sacrifice: human });
    settle(game);
    const before = life(game);
    toStep(game, "upkeep");
    toStep(game, "precombat-main");
    expect(life(game)).toBe(before);
    expect(zone(game, human2)).not.toBe("battlefield");
  });
});

describe("Death's Caress", () => {
  it("gains life equal to a destroyed Human's toughness, and none for a non-Human", () => {
    const { game } = table();
    const human = spawn(game, "Loyal Cathar", B);
    lands(game, "Swamp", 10);
    const before = life(game);
    cast(game, toHand(game, "Death's Caress"), { targets: [ref(human)] });
    expect(life(game)).toBe(before + 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Death's Caress"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(before + 2);
  });
});

describe("Loyal Cathar", () => {
  it("returns transformed at the beginning of the next end step", () => {
    const { game } = table();
    const cathar = spawn(game, "Loyal Cathar");
    destroy(game, cathar);
    expect(zone(game, cathar)).toBe("graveyard");
    toStep(game, "cleanup");
    settle(game);
    expect(zone(game, cathar)).toBe("battlefield");
    expect(printedCardName(game.state.objects[cathar])).toBe("Unhallowed Cathar");
    expect(pt(game, cathar)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Mindshrieker", () => {
  it("gets +X/+X for the milled card's mana value", () => {
    const { game } = table();
    const shrieker = spawn(game, "Mindshrieker");
    lands(game, "Island", 2);
    toLibrary(game, "Murder of Crows", B);
    activate(game, shrieker, 0, { targets: [ref(B)] });
    expect(pt(game, shrieker)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Geist of Saint Traft", () => {
  it("attacks with a 4/4 Angel that is exiled at end of combat", () => {
    const { game, a } = table();
    const geist = spawn(game, "Geist of Saint Traft");
    const before = life(game, B);
    attack(game, a, [geist]);
    expect(life(game, B)).toBe(before - 6);
    expect(tokensNamed(game, "4/4 Angel Token")).toBe(0);
  });

  it("exiles both Angels when Doubling Season makes two (the ruling), and so does Invocation of Saint Traft", () => {
    for (const viaAura of [false, true]) {
      const { game, a } = table();
      spawn(game, "Doubling Season");
      const attacker = spawn(game, viaAura ? "Grizzly Bears" : "Geist of Saint Traft");
      if (viaAura) {
        lands(game, "Plains", 2);
        lands(game, "Island", 1);
        cast(game, toHand(game, "Invocation of Saint Traft"), { targets: [ref(attacker)] });
      }
      const before = life(game, B);
      attack(game, a, [attacker]);
      expect(life(game, B)).toBe(before - 2 - 8);
      expect(tokensNamed(game, "4/4 Angel Token")).toBe(0);
    }
  });
});

describe("Falkenrath Torturer", () => {
  it("gains flying, and a counter only for a sacrificed Human", () => {
    const { game } = table();
    const torturer = spawn(game, "Falkenrath Torturer");
    const human = spawn(game, "Disciple of Griselbrand");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: torturer, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(keywords(game, torturer).has("flying")).toBe(true);
    expect(counters(game, torturer)).toBe(0);
    game.dispatch({ type: "activate-ability", player: A, source: torturer, abilityIndex: 0, targets: [], sacrifice: human });
    settle(game);
    expect(counters(game, torturer)).toBe(1);
  });
});

describe("Desperate Ravings", () => {
  it("draws two and discards one at random", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Desperate Ravings");
    const before = hand(game).length;
    cast(game, spell);
    // −1 the spell, +2 drawn, −1 discarded.
    expect(hand(game).length).toBe(before);
  });
});

describe("Boneyard Wurm", () => {
  it("counts creature cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    const wurm = enter(game, "Boneyard Wurm");
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 2 });
  });
});
