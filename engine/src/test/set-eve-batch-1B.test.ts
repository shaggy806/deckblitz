import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  registryOf,
  ref,
  spawn,
  toHand,
  zone,
  table,
  destroy,
  named,
  watchTargets,
  toGraveyard,
} from "./harness.js";

describe("Eventide batch 1B", () => {
  it("Soot Imp: a nonblack spell costs its caster 1 life; a black one doesn't", () => {
    const { game } = table();
    spawn(game, "Soot Imp", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Dark Ritual"));
    expect(life(game, A)).toBe(19);
  });

  it("Inundate returns nonblue creatures only", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    lands(game, "Island", 3);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Inundate"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("Gift of the Deity: on a green creature +1/+1 only; on a black one +1/+1 and deathtouch", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    a.chooseTargetsFn = () => [ref(bears)];
    cast(game, toHand(game, "Gift of the Deity"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
    const zombies = spawn(game, "Scathe Zombies");
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Gift of the Deity"), { targets: [ref(zombies)] });
    expect(pt(game, zombies)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, zombies).has("deathtouch")).toBe(true);
    // The Lure clause holds only on the green one.
    const restrictions = (id: string) => computeCharacteristics(game.state, registryOf(game), id as typeof bears).restrictions;
    expect(restrictions(bears).has("must-be-blocked")).toBe(true);
    expect(restrictions(zombies).has("must-be-blocked")).toBe(false);
  });

  it("Chaotic Backlash counts each white and/or blue permanent the target controls once, twice over", () => {
    const { game } = table();
    spawn(game, "Savannah Lions", B);
    spawn(game, "Wind Drake", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Wind Drake", A);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Chaotic Backlash"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("Cankerous Thirst with only {B} spent: the -3/-3 half alone", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Cankerous Thirst"), { targets: [ref(giant), ref(bears)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Cankerous Thirst with {B} and {G} spent may target the same creature twice", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Cankerous Thirst"), { targets: [ref(giant), ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Voracious Hatchling enters with four -1/-1 counters; a white-black spell removes two", () => {
    const { game } = table();
    const hatchling = enter(game, "Voracious Hatchling");
    expect(counters(game, hatchling, "-1/-1")).toBe(4);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Cauldron Haze"), { targets: [] });
    expect(counters(game, hatchling, "-1/-1")).toBe(2);
  });

  it("Nightsky Mimic becomes a 4/4 flier only off a spell that's both white and black", () => {
    const { game } = table();
    const mimic = spawn(game, "Nightsky Mimic");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Savannah Lions"));
    expect(pt(game, mimic)).toEqual({ power: 2, toughness: 1 });
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Cauldron Haze"), { targets: [] });
    expect(pt(game, mimic)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mimic).has("flying")).toBe(true);
  });

  it("Outrage Shaman deals damage equal to red symbols among your permanents, its own included", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    const target = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(target)];
    enter(game, "Outrage Shaman");
    // {3}{R}{R} + Hill Giant's {3}{R}: 3 damage.
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("Cauldron Haze: a target that dies returns with a -1/-1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Cauldron Haze"), { targets: [ref(bears)] });
    destroy(game, bears);
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(1);
  });

  it("Nucklavee returns a red sorcery and a blue instant, not a red instant", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const axe = toGraveyard(game, "Lava Axe");
    const opt = toGraveyard(game, "Opt");
    pickModes(a, 0);
    const offers: (readonly (string)[])[] = [];
    watchTargets(a, (offered) => {
      offers.push(offered[0]);
      return [offered[0][0] ?? null];
    });
    enter(game, "Nucklavee");
    expect(zone(game, axe)).toBe("hand");
    expect(zone(game, opt)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(offers.flat()).not.toContain(bolt);
  });
});
