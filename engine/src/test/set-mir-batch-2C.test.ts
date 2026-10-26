import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  keywords,
  lands,
  life,
  nextTurn,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Mirage batch 2, group C", () => {
  it("Discordant Spirit grows by the damage dealt to you on an opponent's turn, then sheds it on yours", () => {
    const { game } = table();
    const spirit = spawn(game, "Discordant Spirit", A);
    nextTurn(game); // bob's turn
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(17);
    toStep(game, "end", B);
    settle(game);
    expect(counters(game, spirit)).toBe(3);
    toStep(game, "end", A);
    settle(game);
    expect(counters(game, spirit)).toBe(0);
  });

  it("Spectral Guardian gives noncreature artifacts shroud only while it's untapped", () => {
    const { game } = table();
    spawn(game, "Spectral Guardian", A);
    const ring = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    expect(keywords(game, ring).has("shroud")).toBe(true);
    expect(keywords(game, thopter).has("shroud")).toBe(false);

    const second = table();
    spawn(second.game, "Spectral Guardian", A, { tapped: true });
    const ring2 = spawn(second.game, "Sol Ring", B);
    expect(keywords(second.game, ring2).has("shroud")).toBe(false);
  });

  it("Tidal Wave's 5/5 Wall is sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Tidal Wave"));
    expect(tokensNamed(game, "Wall Token (5/5 blue, defender)", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Wall Token (5/5 blue, defender)", A)).toBe(0);
  });

  it("Reign of Chaos destroys a Plains and a white creature, and won't take a blue one in that mode", () => {
    const { game } = table();
    const plains = spawn(game, "Plains", B);
    const lions = spawn(game, "Savannah Lions", B);
    const blue = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 4);
    const reign = toHand(game, "Reign of Chaos");
    expect(() => cast(game, reign, { modes: [0], targets: [ref(plains), ref(blue)] })).toThrow();
    cast(game, reign, { modes: [0], targets: [ref(plains), ref(lions)] });
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("Raging Spirit becomes colorless until end of turn", () => {
    const { game } = table();
    const spirit = spawn(game, "Raging Spirit", A);
    lands(game, "Mountain", 2);
    activate(game, spirit);
    expect(computeCharacteristics(game.state, registryOf(game), spirit).colors.size).toBe(0);
    nextTurn(game);
    expect(computeCharacteristics(game.state, registryOf(game), spirit).colors.has("R")).toBe(true);
  });

  it("Emberwilde Caliph's controller loses life equal to the damage it deals", () => {
    const { game, a } = table();
    const caliph = spawn(game, "Emberwilde Caliph", A);
    attack(game, a, [caliph]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(16);
  });
});
