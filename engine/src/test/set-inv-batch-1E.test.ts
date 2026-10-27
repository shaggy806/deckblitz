import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Invasion batch 1, group E", () => {
  it("Backlash taps the creature and it deals its power to its controller", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Backlash"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
  });

  it("Kavu Lair draws for the controller of an entering power-4 creature only", () => {
    const { game } = table();
    spawn(game, "Kavu Lair", A);
    const before = hand(game, B).length;
    game.debugSpawn("Grizzly Bears", B, "battlefield", { announceEntry: true });
    settle(game);
    expect(hand(game, B).length).toBe(before);
    game.debugSpawn("Craw Wurm", B, "battlefield", { announceEntry: true });
    settle(game);
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Prohibit counters a mana value 3 spell only when kicked", () => {
    const { game } = table();
    lands(game, "Island", 14);
    const base = hand(game, A).length;
    const first = toHand(game, "Divination");
    cast(game, first, { settle: false });
    cast(game, toHand(game, "Prohibit"), { targets: [ref(first)] });
    // Unkicked: Divination (mana value 3) resolves and draws two.
    expect(hand(game, A).length).toBe(base + 2);

    const second = toHand(game, "Divination");
    cast(game, second, { settle: false });
    cast(game, toHand(game, "Prohibit"), { targets: [ref(second)], kicked: true });
    expect(hand(game, A).length).toBe(base + 2);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("Treva, the Renewer: pay {2}{W}, choose a color, gain 1 life per permanent of it", () => {
    const { game, a } = table();
    const treva = spawn(game, "Treva, the Renewer", A);
    spawn(game, "Savannah Lions", B);
    spawn(game, "Savannah Lions", A);
    lands(game, "Plains", 3);
    pickModes(a, 0); // yes to the payment; White for the color
    attack(game, a, [treva]);
    // Treva and two Savannah Lions are white.
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(14);
  });

  it("Tsabo Tavoc destroys only a legendary creature", () => {
    const { game, a } = table();
    const tsabo = spawn(game, "Tsabo Tavoc", A);
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    pickTargets(a, isamaru);
    activate(game, tsabo, 0, { targets: [ref(isamaru)] });
    expect(zone(game, isamaru)).toBe("graveyard");
  });

  it("Restock returns two cards and exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    const restock = toHand(game, "Restock");
    cast(game, restock, { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, restock)).toBe("exile");
  });

  it("Tribal Flames counts basic land types", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Tribal Flames"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("Chaotic Strike can't be cast in a main phase", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", A);
    expect(() => cast(game, toHand(game, "Chaotic Strike"), { targets: [ref(bears)] })).toThrow(/refused/);
  });
});
