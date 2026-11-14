/**
 * What a behold cost took, read by the spell it paid for (`{ paid: "beheld" }`,
 * rule 701.4a): Dragon's Fire's "deals damage equal to the power of that card
 * or creature instead" — a chosen Dragon's power as the spell resolves, or as
 * it last existed on the battlefield once it has left (the ruling); a
 * revealed Dragon card's as it was in the hand.
 */
import { describe, expect, it } from "vitest";
import {
  activate,
  B,
  cast,
  destroy,
  lands,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Dragon's Fire", () => {
  it("deals 3 unbeheld", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Shivan Dragon");
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Dragon's Fire"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("a chosen Dragon's power, or a revealed Dragon card's", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const whelp = spawn(game, "Dragon Whelp");
    const shivan = toHand(game, "Shivan Dragon");
    const first = spawn(game, "Colossal Dreadmaw", B);
    const second = spawn(game, "Colossal Dreadmaw", B);
    const seen = pickFromZone(a, whelp);
    cast(game, toHand(game, "Dragon's Fire"), { targets: [ref(first)], kicked: true });
    expect([...seen.offered].sort()).toEqual([whelp, shivan].sort());
    expect(game.state.objects[first].damageMarked).toBe(2);
    pickFromZone(a, shivan);
    cast(game, toHand(game, "Dragon's Fire"), { targets: [ref(second)], kicked: true });
    expect(zone(game, shivan)).toBe("hand");
    expect(game.state.objects[second].damageMarked).toBe(5);
  });

  it("the chosen Dragon's power as the spell resolves, or as it last was if it has left", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const whelp = spawn(game, "Dragon Whelp");
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    pickFromZone(a, whelp);
    cast(game, toHand(game, "Dragon's Fire"), { targets: [ref(wurm)], kicked: true, settle: false });
    // Pumped twice in response: 4 power as it resolves.
    activate(game, whelp, 0, { settle: false });
    activate(game, whelp, 0, { settle: false });
    settle(game);
    expect(game.state.objects[wurm].damageMarked).toBe(4);

    const { game: g2, a: a2 } = table();
    lands(g2, "Mountain", 2);
    const whelp2 = spawn(g2, "Dragon Whelp");
    const wurm2 = spawn(g2, "Colossal Dreadmaw", B);
    pickFromZone(a2, whelp2);
    cast(g2, toHand(g2, "Dragon's Fire"), { targets: [ref(wurm2)], kicked: true, settle: false });
    destroy(g2, whelp2);
    settle(g2);
    expect(zone(g2, whelp2)).toBe("graveyard");
    expect(g2.state.objects[wurm2].damageMarked).toBe(2);
  });
});
