/**
 * Dominaria, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
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

describe("Urza's Tome", () => {
  it("exiles a historic card from the graveyard instead of discarding", () => {
    const { game, a } = table();
    const tome = spawn(game, "Urza's Tome");
    lands(game, "Wastes", 3);
    const wand = toGraveyard(game, "Sorcerer's Wand");
    const before = hand(game).length;
    pickModes(a, 0);
    pickFromZone(a, wand);
    activate(game, tome);
    expect(zone(game, wand)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });

  it("discards when there's no historic card to exile", () => {
    const { game } = table();
    const tome = spawn(game, "Urza's Tome");
    lands(game, "Wastes", 3);
    toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, tome);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(2);
  });
});

describe("Tiana, Ship's Caretaker", () => {
  it("returns a destroyed Equipment to hand at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Tiana, Ship's Caretaker");
    const wand = spawn(game, "Sorcerer's Wand");
    pickModes(a, 0);
    destroy(game, wand);
    expect(zone(game, wand)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, wand)).toBe("hand");
  });
});

describe("Sorcerer's Wand", () => {
  it("deals 2 from a Wizard, 1 from anything else", () => {
    for (const [holder, expected] of [
      ["Ghitu Journeymage", 18],
      ["Grizzly Bears", 19],
    ] as const) {
      const { game } = table();
      const wand = spawn(game, "Sorcerer's Wand");
      const creature = spawn(game, holder);
      lands(game, "Wastes", 3);
      activate(game, wand, 0, { targets: [ref(creature)] });
      activate(game, creature, 0, { targets: [ref(B)] });
      expect(life(game, B)).toBe(expected);
    }
  });
});

describe("Gift of Growth", () => {
  it("kicked, untaps the creature and gives it +4/+4", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Gift of Growth"), { targets: [ref(bears)], kicked: true });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Saproling Migration", () => {
  it("kicked, makes four Saprolings", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Wastes", 5);
    cast(game, toHand(game, "Saproling Migration"), { kicked: true });
    expect(tokensNamed(game, "Saproling Token", A)).toBe(4);
  });
});

describe("Guardians of Koilos", () => {
  it("may return another historic permanent you control", () => {
    const { game, a } = table();
    const wand = spawn(game, "Sorcerer's Wand");
    pickTargets(a, wand);
    pickModes(a, 0);
    enter(game, "Guardians of Koilos");
    expect(zone(game, wand)).toBe("hand");
  });
});

describe("Adeliz, the Cinder Wind", () => {
  it("pumps every Wizard you control, not other creatures", () => {
    const { game } = table();
    const adeliz = spawn(game, "Adeliz, the Cinder Wind");
    const ghitu = spawn(game, "Ghitu Journeymage");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shivan Fire"), { targets: [ref(theirs)] });
    expect(pt(game, adeliz)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, ghitu)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ghitu Journeymage", () => {
  it("deals 2 to each opponent only with another Wizard", () => {
    const alone = table();
    enter(alone.game, "Ghitu Journeymage");
    expect(life(alone.game, B)).toBe(20);
    const withWizard = table();
    spawn(withWizard.game, "Vodalian Arcanist");
    enter(withWizard.game, "Ghitu Journeymage");
    expect(life(withWizard.game, B)).toBe(18);
  });
});

describe("Academy Journeymage", () => {
  it("costs {1} less with a Wizard", () => {
    const { game, a } = table();
    spawn(game, "Ghitu Journeymage");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Academy Journeymage"));
    expect(zone(game, theirs)).toBe("hand");
  });
});

describe("Serra Disciple", () => {
  it("gets +1/+1 when you cast an artifact spell", () => {
    const { game } = table();
    const disciple = spawn(game, "Serra Disciple");
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sorcerer's Wand"));
    expect(pt(game, disciple)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Benalish Honor Guard", () => {
  it("gets +1/+0 for each legendary creature you control", () => {
    const { game } = table();
    const guard = spawn(game, "Benalish Honor Guard");
    spawn(game, "Adeliz, the Cinder Wind");
    spawn(game, "Adeliz, the Cinder Wind", B);
    expect(pt(game, guard)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Karplusan Hound", () => {
  it("deals 2 when it attacks only while you control a Chandra", () => {
    for (const [chandra, expected] of [
      [true, 15],
      [false, 17],
    ] as const) {
      const { game, a } = table();
      const hound = spawn(game, "Karplusan Hound");
      if (chandra) spawn(game, "Chandra, Torch of Defiance");
      pickTargets(a, B);
      attack(game, a, [hound]);
      expect(life(game, B)).toBe(expected);
    }
  });
});

describe("Dark Bargain", () => {
  it("puts two of the top three into hand, one into the graveyard, and deals 2 to you", () => {
    const { game, a } = table();
    const [x, y] = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Shivan Fire")];
    toLibrary(game, "Divest");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const before = hand(game).length;
    pickFromZone(a, x, y);
    cast(game, toHand(game, "Dark Bargain"));
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
    expect(graveyard(game).length).toBe(2);
    expect(life(game)).toBe(18);
  });
});
